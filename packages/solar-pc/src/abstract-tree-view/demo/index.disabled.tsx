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
      { id: 1, name: '集团', status: '可用', parentId: 0 },
      { id: 2, name: '华南', status: '不可用', parentId: 1 },
      { id: 3, name: '华东', status: '可用', parentId: 1 },
      { id: 4, name: '华南分公司', status: '不可用', parentId: 2 },
      { id: 5, name: '华南分公司二', status: '不可用', parentId: 2 },
      { id: 6, name: '华东分公司', status: '不可用', parentId: 3 },
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