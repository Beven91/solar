import React, { } from 'react';
import { AbstractTable, AbstractColumns } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';
import image1 from './images/surface.png';
import image2 from './images/mac.png';
import image3 from './images/thinkpad.png';

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

const demoRows = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 1, picture: image1 },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 2, picture: image2 },
  { id: 3, name: 'Thinkpad', price: 10000, status: 3, picture: image3 },
];

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price' },
    // 设置枚举列
    { title: '状态', name: 'status', enums: SkuStatus },
    // 使用内置的格式化
    { title: '商品图片', name: 'picture', format: 'image' },
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
        columns={columns}
        onQuery={onQuery}
      />
    </div>
  );
}