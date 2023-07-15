import React, { useState } from 'react';
import { AbstractTableInput } from 'solar-pc';
import { AbstractButtons, AbstractEColumns } from 'solar-pc/src/interface';
import { Input, InputNumber } from 'antd';

interface ActivityModel {
  id: number
  name: string
  price: number
  status: string
}

export default function App() {
  const [rows, setRows] = useState<ActivityModel[]>([]);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name', editor: () => <Input /> },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
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
        rowKey="id"
        onChange={onChange}
        columns={columns}
        buttons={buttons}
        addVisible={(rows) => rows.length < 5}
        value={rows}
      />
    </div>
  );
}