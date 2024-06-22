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

export default function App() {
  const [rows, setRows] = useState<ActivityModel[]>(demoRows);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
    // { title: '扣除', target: 'cell', click: (row) => console.log('扣除', row) },
  ];

  const onChange = (values: ActivityModel[]) => {
    console.log('changed rows', values);
    setRows([...values]);
  };

  return (
    <div
      style={{ height: 360 }}
    >
      <AbstractTableInput
        onChange={onChange}
        columns={columns}
        buttons={buttons}
        addVisible={(rows) => rows.length < 5}
        removeVisible={() => false}
        value={rows}
      />
    </div>
  );
}