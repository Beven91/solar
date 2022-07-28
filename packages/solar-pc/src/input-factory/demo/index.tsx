import React from 'react';
import { InputFactory } from 'solar-pc';
import { Form } from 'antd';

export default function App() {
  return (
    <div>
      <Form.Item
        label="名称"
      >
        {InputFactory.create('input', { initialValue: '111' })}
      </Form.Item>
      <Form.Item
        label="头像"
      >
        {InputFactory.create('upload', { initialValue: '111' })}
      </Form.Item>
    </div>
  );
}