import React, { } from 'react';
import { AbstractTable, AbstractColumns } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
  status: number
}

const demoRows: ActivityModel[] = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 1 },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 2 },
  { id: 3, name: 'Thinkpad', price: 10000, status: 3 },
];

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name', width: 200 },
    { title: '商品价格', name: 'price', width: 100 },
  ];

  const onQuery = (query: AbstractQueryType) => {
    const rows = demoRows;
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
        select="multiple"
        columns={columns}
        onQuery={onQuery}
        rowKey="id"
        onSelectRows={(rows) => console.log('选择行:', rows)}
      />
    </div>
  );
}