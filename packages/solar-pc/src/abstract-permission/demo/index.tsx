import React, { useContext } from 'react';
import { AbstractPermission, PermissionContextModel, AbstractButtons, AbstractTable, AbstractColumns } from 'solar-pc';
import { Button } from 'antd';

const demoRows = {
  count: 3,
  models: [
    { id: 1, name: 'Surface Book3', price: 17800, status: 'new' },
    { id: 2, name: 'Mac Book Pro3', price: 20000, status: 'online' },
    { id: 3, name: 'Thinkpad', price: 10000, status: 'offline' },
  ],
};

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
      userName: '小泰',
      roles: {
        'admin': true,
      },
    });
  };

  const buttons: AbstractButtons<any> = [
    { title: '审核', target: 'cell', roles: 'super' },
    { title: '新增商品', roles: 'super' },
    { title: '修改', target: 'cell' },
  ];

  const columns: AbstractColumns<any> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price' },
  ];

  return (
    <AbstractPermission
      initPermission={queryPermissions}
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

      <AbstractTable
        style={{ marginTop: 20 }}
        data={demoRows}
        columns={columns}
        buttons={buttons}
      />

    </AbstractPermission>
  );
}