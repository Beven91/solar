import React, { useState } from 'react';
import { AbstractTablePicker } from 'solar-pc';
import { AbstractSFields, AbstractEColumns, AbstractQueryType } from 'solar-pc/src/interface';
import { InputNumber } from 'antd';

interface ActivityModel {
  id: number
  name: string
  price: number
  code: string
}

const demoRows: ActivityModel[] = [
  { id: 1, name: 'Surface Book3', price: 17800, code: 'A0001' },
  { id: 2, name: 'Mac Book Pro3', price: 20000, code: 'A0002' },
  { id: 3, name: 'Thinkpad', price: 10000, code: 'A0003' },
  { id: 4, name: 'Neux', price: 12400, code: 'A0004' },
  { id: 5, name: 'Opps', price: 300, code: 'A0005' },
  { id: 6, name: 'Moto', price: 2600, code: 'A0006' },
  { id: 7, name: 'Nano', price: 3200, code: 'A0007' },
];

export default function App() {
  const [code, setCode] = useState<ActivityModel>(demoRows[0]);

  const columns: AbstractEColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price', editor: () => <InputNumber /> },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
  ];

  const onChange = (value: ActivityModel) => {
    console.log('selected row:', value);
    setCode(value);
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
      <AbstractTablePicker.InputPicker
        title="商品选择"
        width={800}
        height={600}
        rowKey="id"
        pageSize={6}
        allowClear
        valueMode="object"
        searchFields={search}
        onQuery={onQuery}
        onChange={onChange}
        columns={columns}
        value={code}
        valueField="code"
        placeholder="请选择商品编码"
      />
    </div>
  );
}