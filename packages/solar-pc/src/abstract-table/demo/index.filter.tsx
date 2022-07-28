import React, { } from 'react';
import { AbstractTable, AbstractColumns } from 'solar-pc';
import { AbstractFilters, AbstractQueryType } from 'solar-pc/src/interface';
import image1 from './images/surface.png';
import image2 from './images/mac.png';
import image3 from './images/thinkpad.png';

interface ActivityModel {
  id: number
  name: string
  price: number
}

const SkuStatus = [
  { label: '上线', value: 1 },
  { label: '下线', value: 2 },
  { label: '其他', value: 3 },
];

const demoRows = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 1, picture: image1 },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 2, picture: image2 },
  { id: 3, name: 'Thinkpad', price: 10000, status: 3, picture: image3 },
];

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