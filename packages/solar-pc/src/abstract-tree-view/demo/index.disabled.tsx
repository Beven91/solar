import React from 'react';
import { AbstractTreeView } from 'solar-pc';
import { AbstractButtons, AbstractQueryType } from 'solar-pc/src/interface';

interface MenuModel {
  name:string
  id:number
  parentId:number
}

export default function App() {
  const onQuery = (query:AbstractQueryType)=>{
    return Promise.resolve([
      { name: '订单管理', id: 1, parentId: 0 },
      { name: '退货管理', id: 3, parentId: 1 },
      { name: '订单审核', id: 4, parentId: 1 },
      { name: '商品管理', id: 20, parentId: 0 },
      { name: '库存管理', id: 21, parentId: 20 },
    ]);
  };

  const buttons:AbstractButtons<MenuModel> = [
    { title: '修改', target: 'cell' },
    { title: '新增子节点', target: 'cell' },
  ];

  return (
    <AbstractTreeView
      buttons={buttons}
      onQuery={onQuery}
      rowKey="id"
      labelKey="name"
      disabled
      getRootNodes={(data)=>data['0']?.children || [] }
    >

    </AbstractTreeView>
  );
}