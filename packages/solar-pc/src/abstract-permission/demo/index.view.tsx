import React, { useContext } from 'react';
import { AbstractPermission, PermissionContextModel, Exception } from 'solar-pc';
import { Button } from 'antd';

function ApplyPermission() {
  const context = useContext<PermissionContextModel>(AbstractPermission.Context);
  return (
    <Exception
      onClick={() => {
        context.user.roles['admin'] = true;
        context.updateUser({
          ...context.user,
        });
      }}
      type="500"
      btnText="申请权限"
      title="您没有权限查看此内容"
      desc="您可能需要申请权限"
    />
  );
}

export default function App() {
  // 加载权限
  const queryPermissions = () => {
    return Promise.resolve({
      id: 0,
      userName: '小河',
      roles: {
      },
    });
  };


  return (
    <AbstractPermission
      failRender={() => <ApplyPermission /> }
      initPermission={queryPermissions}
    >
      <AbstractPermission.Permission roles="admin">
        <Button style={{ margin: '0 10px' }}>管理员可见</Button>
      </AbstractPermission.Permission>
    </AbstractPermission>
  );
}