import React, { useState } from 'react';
import { AbstractTablePicker } from 'solar-pc';
import { AbstractSFields, AbstractEColumns, AbstractQueryType } from 'solar-pc/src/interface';
import { Button, InputNumber } from 'antd';

interface ActivityModel {
  id: number
  name: string
  price: number
}

const demoRows: ActivityModel[] = [
  { id: 1, name: 'Surface Book3', price: 17800 },
  { id: 2, name: 'Mac Book Pro3', price: 20000 },
  { id: 3, name: 'Thinkpad', price: 10000 },
  { id: 4, name: 'Neux', price: 12400 },
  { id: 5, name: 'Opps', price: 300 },
  { id: 6, name: 'Moto', price: 2600 },
  { id: 7, name: 'Nano', price: 3200 },
];

export default function App() {
  const [rows, setRows] = useState<ActivityModel[]>([]);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
  ];

  const onChange = (values: ActivityModel[]) => {
    console.log('选择商品:\n', values);
    setRows([...values]);
  };

  const onQuery = (query: AbstractQueryType) => {
    const rows = query.query.name ? demoRows.filter((m) => m.name.indexOf(query.query.name) > -1) : demoRows;
    return Promise.resolve({
      count: rows.length,
      models: rows,
    });
  };

  return (
    <div >
      <AbstractTablePicker
        title="商品选择"
        width={800}
        height={500}
        rowKey="id"
        pageSize={3}
        searchFields={search}
        onQuery={onQuery}
        onChange={onChange}
        columns={columns}
        value={rows}
      >
        <Button type="primary">点击选择商品</Button>
      </AbstractTablePicker>
    </div>
  );
}