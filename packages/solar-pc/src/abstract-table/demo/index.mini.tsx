import React, { useCallback } from 'react';
import { AbstractTable, AbstractColumns, AbstractButtons, AbstractSFields } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';

interface ActivityModel {
  id: number
  name: string
  price: number
  status: string
}

const demoRows = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 'new' },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 'online' },
  { id: 3, name: 'Thinkpad', price: 10000, status: 'offline' },
];

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price' },
  ];

  const onAsyncClick = useCallback(async(rows: ActivityModel[]) => {
    console.log('批量上架:', rows);
    return new Promise((resolve) => {
      console.log('批量上架成功');
      setTimeout(() => resolve({}), 3000);
    });
  }, []);

  const buttons: AbstractButtons<ActivityModel> = [
    // 行内按钮，
    { title: '修改', target: 'cell', click: (row) => console.log('修改行:', row) },
    // 触发动作的按钮
    { title: '动作', action: 'demo' },
    // 顶部按钮
    { title: '新增商品', icon: <PlusOutlined />, click: () => console.log('点击了新增') },
    // 单选
    { title: '上架商品(单选)', icon: <SyncOutlined />, confirm: 'ssdfsf', select: 'single', click: (row) => console.log('上架商品:', row) },
    // 多选行
    { title: '批量上架(多选)', confirm: '您确定要批量上架?', select: 'multiple', click: onAsyncClick },
    // 按钮是否可见
    {
      title: '审核',
      target: 'cell',
      visible: (row) => row.status == 'new',
      click: (row) => console.log('审核:', row),
    },
    // 确认提示按钮
    { title: '删除', target: 'cell', confirm: '您确定要删除商品', click: (row) => console.log('删除商品:', row) },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
    { title: '编号', name: 'id' },
  ];

  const onQuery = (query: AbstractQueryType) => {
    console.log('query', query);
    const rows = query.query.name ? demoRows.filter((m) => m.name.indexOf(query.query.name) > -1) : demoRows;
    return Promise.resolve({
      count: rows.length,
      models: rows,
    });
  };

  return (
    <div
      style={{ height: 420 }}
    >
      <AbstractTable
        rowKey="id"
        layoutMode="mini"
        onActionRoute={(action) => console.log('进入动作:', action)}
        columns={columns}
        buttons={buttons}
        onQuery={onQuery}
        searchFields={search}
      />
    </div>
  );
}