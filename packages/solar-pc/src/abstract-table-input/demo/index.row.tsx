import React, { useState } from 'react';
import { AbstractTableInput } from 'solar-pc';
import { AbstractButtons, AbstractEColumns } from 'solar-pc/src/interface';
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

const demoRows2 = [
  { id: 1, name: 'Surface Book4', price: 22000, status: 'new' },
  { id: 2, name: 'Mac Book Pro4', price: 20000, status: 'online' },
  { id: 3, name: 'Thinkpad4', price: 15000, status: 'offline' },
];

export default function App() {
  const [rows, setRows] = useState<ActivityModel[]>(demoRows);
  const [id, setId] = useState(0);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const rules = {
    price: [{ required: true, message: '请输入价格' }],
  };

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '切换数据源', click: () => setRows([...demoRows2]), type: 'default' },
    { title: '模拟刷新', click: () => setId(id + 1), type: 'dashed', danger: true },
    { title: '提交', click: () => console.log(rows) },
  ];

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
        buttons={buttons}
        onSave={onSave}
        onChange={onChange}
        columns={columns}
        value={rows}
        rules={rules}
      />
    </div>
  );
}