import React from 'react';

interface UserRoles {
  [propName: string]: boolean
}

export interface PermissionUser {
  /**
   * 当前用户角色信息
   * 例如: { admin: true, super: true }
   */
  roles:UserRoles
  // 用户名称
  userName:string
  // 当前登录用户id
  id:string | number
  // 额外数据
  [propName: string]: any
}

export interface PermissionContextModel {
  user:PermissionUser
  loading:boolean
  failRotueRender?:()=> React.ReactElement
  failRender?:()=> React.ReactElement
  refresh:()=> void
  updateUser:(user:PermissionUser)=> void
}

export default React.createContext<PermissionContextModel>({} as PermissionContextModel);
