import React from 'react';
import { AdvancePicker } from 'solar-pc';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
];

export default function App() {
  return (
    <div style={{ width: 300 }}>
      <AdvancePicker data={data} />
    </div>
  );
}