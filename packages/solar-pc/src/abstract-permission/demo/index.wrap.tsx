import React, { useContext } from 'react';
import { AbstractPermission, PermissionContextModel } from 'solar-pc';
import { Button, ButtonProps } from 'antd';

const PermissionButton = AbstractPermission.createPermissionView<ButtonProps>(Button);

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
  const queryPermissions = () => {
    return Promise.resolve({
      id: 0,
      userName: '小泰',
      roles: {
      },
    });
  };


  return (
    <AbstractPermission
      initPermission={queryPermissions}
    >
      <Button>无需权限</Button>
      <PermissionButton style={{ margin: '0 10px' }} roles="super" >管理员可见</PermissionButton>

      <div style={{ marginTop: 20 }}>
        <ApplyPermission />
      </div>
    </AbstractPermission>
  );
}