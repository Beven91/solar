import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';

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
      okConfirm={{ title: '您确定要提交?', content: '提交后将无法撤回,确认继续?' }}
      cancelConfirm={{ title: '您确定要取消?', content: '取消后无法保存?' }}
      onSubmit={(values) => console.log(values)}
      onCancel={() => console.log('取消编辑')}
    >
      <AbstractForm rules={rules} groups={groups} />
    </AbstractObject>
  );
}