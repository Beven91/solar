import React from 'react';
import { AbstractSearch, AbstractSFields } from 'solar-pc';
import { InputNumber } from 'antd';

export default function App() {
  const fields: AbstractSFields = [
    { title: '用户名', name: 'name' },
    { title: '年龄', name: 'age', render: <InputNumber /> },
  ];

  return (
    <AbstractSearch
      fields={fields}
      actionStyle="newline"
      onClean={()=>console.log('清空查询')}
      onQuery={(query) => console.log('search', query)}
    />
  );
}