import React, { useState } from 'react';
import { AdvancePicker, PageQueryData } from '-pc';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
  { value: 4, label: '栗子' },
  { value: 5, label: '桃子' },
  { value: 6, label: '猕猴桃' },
  { value: 7, label: '蛇果' },
  { value: 8, label: '坚果' },
  { value: 9, label: '葡萄' },
  { value: 10, label: '蓝莓' },
  { value: 11, label: '柚子' },
  { value: 12, label: '牛油果' },
  { value: 13, label: '西柚' },
  { value: 14, label: '橘子' },
  { value: 15, label: '橙子' },
  { value: 16, label: '西瓜' },
];

const queryAllRecords = (query: PageQueryData) => {
  console.log('请求参数: ', query);
  return new Promise<{ count:number, models:any[] }>((resolve)=>{
    const start = (query.pageNo - 1) * query.pageSize;
    const end = start + query.pageSize;
    // 这里模拟远程请求
    const rows = data.filter((item) => query.filter ? item.label.indexOf(query.filter) > -1 : true);
    const filterd = rows.slice(start, end);
    setTimeout(()=>{
      resolve({
        count: rows.length,
        models: filterd,
      });
    }, 1000);
  });
};

export default function App() {
  const [value, setValue] = useState(1);

  return (
    <div style={{ width: 300 }}>
      <AdvancePicker
        value={value}
        api={queryAllRecords}
        pageSize={10}
        initQuery={false}
        onChange={(v) => {
          setValue(v);
          console.log(v);
        }}
      />
    </div>
  );
}