import React, { useState } from 'react';
import { AbstractTableInput } from 'solar-pc';
import { AbstractEColumns } from 'solar-pc/src/interface';
import { InputNumber } from 'antd';

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
  const [rows, setRows] = useState<ActivityModel[]>(demoRows);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const rules = {
    price: [{ required: true, message: '请输入价格' }],
  };

  const onChange = (values: ActivityModel[]) => {
    console.log('changed rows', values);
    setRows([...values]);
  };

  const onSave = (row: ActivityModel) => {
    console.log('save row', row);
    return Promise.resolve({});
  };

  return (
    <div
      style={{ height: 360 }}
    >
      <AbstractTableInput
        rowKey="id"
        mode="row"
        onSave={onSave}
        onChange={onChange}
        columns={columns}
        value={rows}
        rules={rules}
      />
    </div>
  );
}