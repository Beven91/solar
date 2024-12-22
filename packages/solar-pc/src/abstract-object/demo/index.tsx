import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';
import { } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size?: string
}

export default function App() {
  const [action] = useState<string>('add');
  const [record] = useState<CommodityModel>({
    name: 'Surface Book3',
    color: 'Black',
  });

  const rules: AbstractRules = {
    name: [{ required: true, message: '请设置商品名' }],
    size: [{ required: true, message: '请补充尺寸' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    { title: '商品名', name: 'name', extra: (r)=>r.name },
    { title: '颜色', name: 'color' },
    { title: '尺寸', name: 'size', initialValue: 100 },
  ];

  return (
    <AbstractObject
      action={action}
      record={record}
      onSubmit={(values) => console.log(values)}
      onCancel={() => console.log('取消编辑')}
    >
      <AbstractForm rules={rules} groups={groups} />
    </AbstractObject>
  );
}