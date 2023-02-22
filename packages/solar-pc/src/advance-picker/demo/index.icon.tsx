import React, { useState } from 'react';
import { AdvancePicker } from '-pc';
import { UserOutlined } from '@ant-design/icons';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
  { value: 4, label: '栗子' },
  { value: 5, label: '桃子' },
];

export default function App() {
  const [multiple, setMultiple] = useState();

  console.log('值:', multiple);

  return (
    <div style={{ width: 300 }}>
      <AdvancePicker
        size="large"
        prefix={<UserOutlined />}
        value={multiple}
        onChange={setMultiple}
        data={data}
      />
    </div>
  );
}