import React from 'react';
import { AbstractSearch, AbstractSFields } from 'solar-pc';
import { InputNumber } from 'antd';

export default function App() {
  const fields: AbstractSFields = [
    { title: '用户名', name: 'name' },
    { title: '年龄', name: 'age', render: <InputNumber /> },
    { title: '地址', name: 'address' },
    { title: '省份', name: 'province' },
  ];

  return (
    <AbstractSearch
      fields={fields}
      span={8}
      initialValues={{
        name: '张三',
      }}
      onQuery={(query) => console.log('search', query)}
    />
  );
}