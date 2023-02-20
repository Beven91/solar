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

const originRows = [
  { id: 1, name: 'Surface Book3', price: 17800, status: 'new' },
  { id: 2, name: 'Mac Book Pro3', price: 20000, status: 'online' },
  { id: 3, name: 'Thinkpad', price: 10000, status: 'offline' },
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
    });
  }
  return rows;
};

const demoRows = generate(originRows, 30);


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
      style={{ height: 640, overflowY: 'auto' }}
    >
      <AbstractTableInput
        rowKey="id"
        moveable
        onSave={onSave}
        onChange={onChange}
        columns={columns}
        value={rows}
        rules={rules}
        pagination={{ pageSize: 7 }}
      />
    </div>
  );
}