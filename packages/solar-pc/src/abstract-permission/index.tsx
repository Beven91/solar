/**
 * @module AbstractPermission
 * @description 权限上下文组件
 */
import React from 'react';
import Permission from './permission';
import PermissionContext, { PermissionContextModel, PermissionUser } from './context';

export interface AbstractPermissionProps {
  // 自定义获取权限信息，注意：该函数仅在初始化时调用一次。
  getPermission?: () => Promise<PermissionUser> | PermissionUser
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

export default class AbstractPermission extends React.Component<React.PropsWithChildren<AbstractPermissionProps>, AbstractPermissionState> {
  // 权限控制组件
  static Permission = Permission;

  static Context = PermissionContext;

  static Consumer = PermissionContext.Consumer;

  constructor(props: AbstractPermissionProps) {
    super(props);
    this.state.loading = !!props.getPermission;
  }

  get permissionContext() {
    return {
      loading: this.state.loading,
      user: this.props.user || this.state.user as PermissionUser,
      failRotueRender: this.props.failRotueRender,
      failRender: this.props.failRender,
      refresh: () => {
        this.loadPermissions();
      },
      updateUser: (user: PermissionUser) => {
        this.setState({ user });
      },
    } as PermissionContextModel;
  }

  state: AbstractPermissionState = {
    loading: false,
    user: null as PermissionUser,
  };

  loadPermissions() {
    const { getPermission } = this.props;
    if (getPermission) {
      this.setState({ loading: true });
      Promise
        .resolve(getPermission())
        .then((user: PermissionUser) => this.setState({ loading: false, user }))
        .catch(() => this.setState({ loading: false }));
    }
  }

  componentDidMount() {
    this.loadPermissions();
  }

  render() {
    return (
      <PermissionContext.Provider
        value={this.permissionContext}
      >
        {this.props.children}
      </PermissionContext.Provider>
    );
  }
}
