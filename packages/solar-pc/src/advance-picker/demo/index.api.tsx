import React, { useState } from 'react';
import { AdvancePicker, PageQueryData } from 'solar-pc';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
  { value: 4, label: '栗子' },
  { value: 5, label: '桃子' },
];

const queryAllRecords = (query: PageQueryData) => {
  console.log('请求参数: ', query);
  // 这里模拟远程请求
  const rows = data.filter((item) => query.filter ? item.label.indexOf(query.filter) > -1 : true);
  return Promise.resolve({
    count: rows.length,
    models: rows,
  });
};

export default function App() {
  const [value, setValue] = useState(1);

  return (
    <div style={{ width: 300 }}>
      <AdvancePicker
        value={value}
        api={queryAllRecords}
        onChange={(v) => {
          setValue(v);
          console.log(v);
        }}
      />
    </div>
  );
}