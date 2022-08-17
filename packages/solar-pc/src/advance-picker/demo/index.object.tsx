import React, { useState } from 'react';
import { AdvancePicker } from 'solar-pc';
import { Form } from 'antd';

const data = [
  { value: 1, label: '苹果' },
  { value: 2, label: '香蕉' },
  { value: 3, label: '车厘子' },
];

export default function App() {
  const [value, setValue] = useState([data[0]]);

  return (
    <div style={{ width: 300 }}>
      <Form.Item label="单选">
        <AdvancePicker valueMode="object" data={data} onChange={(v) => console.log(v)} />
      </Form.Item>
      <Form.Item
        label="多选"
      >
        <AdvancePicker
          value={value}
          valueMode="object"
          mode="multiple"
          data={data}
          onChange={(v) => {
            setValue(v);
            console.log(v);
          }}
        />
      </Form.Item>
      <Form.Item label="标签模式">
        <AdvancePicker valueMode="object" mode="tags" data={data} onChange={(v) => console.log(v)} />
      </Form.Item>
    </div>
  );
}