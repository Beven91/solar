import React, { useState } from 'react';
import { AdvancePicker } from '-pc';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
  { value: 4, label: '栗子' },
  { value: 5, label: '桃子' },
];

export default function App() {
  const [multiple, setMultiple] = useState();
  const [tag, setTag] = useState();

  console.log('多选值:', multiple);
  console.log('标签值:', tag);

  return (
    <div style={{ width: 300 }}>
      <h4>多选</h4>
      <AdvancePicker value={multiple} onChange={setMultiple} data={data} mode="multiple" />
      <h4 style={{ marginTop: 10 }}>标签</h4>
      <AdvancePicker onChange={setTag} data={data} mode="tags" />
      <h4 style={{ marginTop: 10 }}>单选标签</h4>
      <AdvancePicker onChange={setTag} data={data} valueMode="tags-single" mode="tags" />
    </div>
  );
}