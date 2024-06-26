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
  const [disabled, setDisabled] = useState(false);
  const [id, setId] = useState(0);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name', width: 160 },
    {
      title: '商品价格',
      name: 'price',
      width: 120,
      editor: {
        cascade: (price) => {
          return {
            status: price > 19000 ? 'good' : 'low',
          };
        },
        render: <InputNumber />,
      },
    },
    {
      title: '售卖价',
      name: 'discount',
      width: 120,
      editor: {
        cascade: (r) => {
          return {
            status: r.price > 19000 ? 'low' : 'good',
          };
        },
        visible: (r) => r.price > 18000,
        render: (row) => <InputNumber disabled={(row.price || 0) <= 0} />,
      },
    },
  ];

  const rules = {
    price: [{ required: true, message: '请输入价格' }],
  };

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '切换数据源', click: () => setRows([...demoRows2]), type: 'default' },
    { title: '模拟刷新', click: () => setId(id + 1), type: 'dashed', danger: true },
    { title: '提交', click: () => console.log(rows) },
    { title: '禁用', click: () => setDisabled(true) },
    { title: '启用', click: () => setDisabled(false) },
  ];

  const onChange = (values: ActivityModel[]) => {
    console.log('changed rows', values);
    setRows([...values]);
  };

  return (
    <div
      style={{ height: 360, overflow: 'auto' }}
    >
      <AbstractTableInput
        disabled={disabled}
        onChange={onChange}
        columns={columns}
        value={rows}
        rules={rules}
        buttons={buttons}
      />
    </div>
  );
}