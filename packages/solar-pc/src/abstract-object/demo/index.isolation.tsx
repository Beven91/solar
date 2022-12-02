import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';
import { } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
}

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  age: [{ required: true, message: '请设置年龄' }],
};

function NestedApp(props:{ value?:any, onChange?:(value:any)=>void }) {
  const groups: AbstractGroups<CommodityModel> = [
    { title: '编号', name: 'id' },
    { title: '年龄', name: 'age' },
  ];

  return (
    <AbstractForm.ISolation rules={rules} value={props.value} onChange={props.onChange} groups={groups} />
  );
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
    { title: '', name: 'user', render2: <NestedApp /> },
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