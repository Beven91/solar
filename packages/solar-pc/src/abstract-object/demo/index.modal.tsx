import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';
import { Button } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
}

export default function App() {
  const [action, setAction] = useState<string>('');
  const [record] = useState<CommodityModel>({
    name: 'Surface Book3',
    color: 'Black',
    size: '',
  });

  const rules: AbstractRules = {
    name: [{ required: true, message: '请设置商品名' }],
    size: [{ required: true, message: '请补充尺寸' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    { title: '商品名', name: 'name' },
    { title: '颜色', name: 'color' },
    { title: '尺寸', name: 'size' },
  ];

  return (
    <div>
      <AbstractObject
        action={action}
        record={record}
        title="新增商品"
        type="modal"
        width={800}
        onSubmit={(values) => console.log(values)}
        onCancel={() => setAction('') }
      >
        <AbstractForm rules={rules} groups={groups} />
      </AbstractObject>
      <Button type="primary" onClick={() => setAction('add')} >新增商品</Button>
    </div>
  );
}