import React, { } from 'react';
import { AbstractTable, AbstractColumns, AbstractButtons, AbstractSFields, ImageGallery } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';

const images= [
  'https://img2.baidu.com/it/u=3147404475,1220123320&fm=253&fmt=auto&app=138&f=JPEG?w=722&h=500',
  'https://img0.baidu.com/it/u=3421052381,2333233004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=411',
];

interface ActivityModel {
  id: number
  name: string
  price: number
}

const originRows = [
  { id: 1, name: 'Surface Book3', price: 17800 },
  { id: 2, name: 'Mac Book Pro3', price: 20000 },
  { id: 3, name: 'Thinkpad', price: 10000 },
  { id: 4, name: 'Surface Book3', price: 17800 },
  { id: 5, name: 'Mac Book Pro3', price: 20000 },
  { id: 6, name: 'Thinkpad', price: 10000 },
  { id: 7, name: 'Surface Book3', price: 17800 },
  { id: 8, name: 'Mac Book Pro3', price: 20000 },
  { id: 9, name: 'Thinkpad', price: 10000 },
  { id: 10, name: 'Surface Book3', price: 17800 },
];

const generate = (demo:typeof originRows, total:number)=>{
  const rows = [];
  for (let i =0; i<total; i++) {
    const item = demo[(i % originRows.length)];
    rows.push({
      id: i,
      name: item.name + '-'+i,
      price: i * 100,
    });
  }
  return rows;
};

const demoRows = generate(originRows, 300);

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name', render: ()=><ImageGallery value={images} /> },
    { title: '商品价格', name: 'price' },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '修改', target: 'cell', click: (row) => console.log('修改行:', row) },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
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
      style={{ height: 530 }}
    >
      <AbstractTable
        rowKey="id"
        columns={columns}
        buttons={buttons}
        onQuery={onQuery}
        searchFields={search}
      />
    </div>
  );
}