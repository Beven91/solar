import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';
import { Button } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
}

export default function App() {
  const [action] = useState<string>('add');
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
    <AbstractObject
      action={action}
      record={record}
      footActions={
        [
          (row, ctx)=>{
            return <Button onClick={ctx.bindValidate(()=>alert('审核成功'))} size="large" type="primary">审核({row.name})</Button>;
          },
        ]
      }
      onSubmit={(values) => console.log(values)}
      onCancel={() => console.log('取消编辑')}
    >
      <AbstractForm rules={rules} groups={groups} />
    </AbstractObject>
  );
}