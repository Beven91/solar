import React, { } from 'react';
import { AbstractTable, AbstractColumns, AbstractButtons, AbstractSFields } from 'solar-pc';
import { AbstractQueryType } from 'solar-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
  [x: string]: any
}

const demoRows = [
  { id: 1, name: 'Surface Book3', price: 17800 },
  { id: 2, name: 'Mac Book Pro3', price: 20000 },
  { id: 3, name: 'Thinkpad', price: 10000 },
];

export default function App() {
  const columns: AbstractColumns<ActivityModel> = [
    { title: '商品名', name: 'name', sort: 'name' },
    { title: '商品价格', name: 'price', sort: 'price' },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '修改', target: 'cell', click: (row) => console.log('修改行:', row) },
  ];

  const search: AbstractSFields = [
    { title: '名称', name: 'name' },
  ];

  const onQuery = (query: AbstractQueryType) => {
    console.log('query', query);
    let rows = query.query.name ? demoRows.filter((m) => m.name.indexOf(query.query.name) > -1) : demoRows;
    if (query.sort) {
      rows = rows.sort((a: any, b: any) => {
        const v1 = a[query.sort];
        const v2 = b[query.sort];
        if (v1 == v2) return 0;
        switch (query.order) {
          case 'ascend':
            return v1 > v2 ? 1 : -1;
          default:
            return v1 < v2 ? 1 : -1;
        }
      });
    }
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
        rowKey="id"
        sort="price"
        order="descend"
        columns={columns}
        buttons={buttons}
        onQuery={onQuery}
        searchFields={search}
      />
    </div>
  );
}