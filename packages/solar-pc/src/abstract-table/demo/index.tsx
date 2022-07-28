import React, { } from 'react';
import { AbstractTable, AbstractColumns, AbstractButtons, AbstractSFields } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
}

const demoRows = [
  { name: 'Surface Book3', price: 17800 },
  { name: 'Mac Book Pro3', price: 20000 },
  { name: 'Thinkpad', price: 10000 },
];

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name' },
    { title: '商品价格', name: 'price' },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '修改', target: 'cell', click: (row) => console.log('修改行:', row) },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
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
      style={{ height: 360 }}
    >
      <AbstractTable
        columns={columns}
        buttons={buttons}
        onQuery={onQuery}
        searchFields={search}
      />
    </div>
  );
}