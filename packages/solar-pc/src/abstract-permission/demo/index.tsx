import React, { useContext } from 'react';
import { AbstractPermission, PermissionContextModel } from 'solar-pc';
import { Button } from 'antd';

function ApplyPermission() {
  const context = useContext<PermissionContextModel>(AbstractPermission.Context);
  return (
    <Button
      type="primary"
      onClick={()=>{
        context.user.roles['super'] = true;
        context.updateUser({
          ...context.user,
        });
      }}
    >
        申请管理员权限
    </Button>
  );
}

export default function App() {
  // 加载权限
  const queryPermissions = ()=>{
    return Promise.resolve({
      id: 0,
      userName: '小河',
      roles: {
        'admin': true,
      },
    });
  };

  return (
    <AbstractPermission
      getPermission={queryPermissions}
    >

      <Button>无需权限</Button>
      <AbstractPermission.Permission roles="admin">
        <Button style={{ margin: '0 10px' }}>管理员可见</Button>
      </AbstractPermission.Permission>
      <AbstractPermission.Permission roles="super">
        <Button> 超级管理员可见</Button>
      </AbstractPermission.Permission>

      <div style={{ marginTop: 20 }}>
        <ApplyPermission />
      </div>

    </AbstractPermission>
  );
}