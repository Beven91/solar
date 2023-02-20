import React, { } from 'react';
import { AbstractTable, AbstractColumns } from 'solar-pc';
import { AbstractFilters, AbstractQueryType } from 'solar-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
  picture: string
}

const SkuStatus = [
  { label: '上线', value: 1 },
  { label: '下线', value: 2 },
  { label: '其他', value: 3 },
];

const originRows = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 1, picture: 'doctor-operationc32d73b0-0466-4ac8-9560-785efb7.png' },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 2, picture: 'doctorSubmitda967950-5af8-4426-9d58-0a9f1df.png' },
  { id: 3, name: 'Thinkpad', price: 10000, status: 3, picture: 'doctorSubmit-5619b20407974ea59941650ebbb61029.jpg' },
];


const generate = (demo:typeof originRows, total:number)=>{
  const rows = [];
  for (let i =0; i<total; i++) {
    const item = demo[(i % originRows.length)];
    rows.push({
      id: i,
      name: item.name + '-'+i,
      price: i * 100,
      status: item.status,
      picture: item.picture,
    });
  }
  return rows;
};

const demoRows = generate(originRows, 40);

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price' },
    { title: '图片', name: 'picture', format: 'image' },
  ];

  const filters: AbstractFilters = {
    name: 'status',
    tabs: SkuStatus,
  };

  const onQuery = (query: AbstractQueryType) => {
    console.log('query', query);
    const status = query.query.status;
    const rows = query.query.status ? demoRows.filter((m) => m.status == status) : demoRows;
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
        columns={columns}
        filters={filters}
        onQuery={onQuery}
      />
    </div>
  );
}