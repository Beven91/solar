import React, { useState } from 'react';
import { AbstractTableInput } from 'solar-pc';
import { AbstractButtons, AbstractEColumns } from 'solar-pc/src/interface';
import { Input, InputNumber } from 'antd';

interface ActivityModel {
  id: number
  name: string
  price: number
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
    const rows = values.map((row) => {
      return {
        id: row.id,
        name: row.name,
        price: row.price,
      };
    });
    setRows(rows);
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
        value={rows}
      />
    </div>
  );
}