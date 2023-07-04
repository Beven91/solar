import React, { useState } from 'react';
import { AbstractObject, AbstractForm, AbstractGroups, AbstractRules, AdvancePicker } from 'solar-pc';
import { } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
  [x: string]: any
}

export default function App() {
  const [action] = useState<string>('add');
  const [record] = useState<CommodityModel>({
    name: 'Surface Book3',
    color: 'Black',
    address: {
      province: '上海',
      city: '上海',
      area: {
        areaName: '测试',
        areaCode: 'aaa',
      },
    },
    favorites: ['苹果', '橘子'],
    relations: [
      { type: '父亲', id: 100 },
      { type: '母亲', id: 200 },
      { type: '其他', id: 300, name: '小东' },
    ],
    tags: ['老人', '小孩'],
    size: '',
  });

  const rules: AbstractRules = {
    name: [{ required: true, message: '请设置商品名' }],
    size: [{ required: true, message: '请补充尺寸' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    { title: '商品名', name: 'name' },
    { title: '颜色', name: 'color' },
    { title: '城市', name: 'address.city' },
    { title: '区域编码', name: 'address.area.areaCode' },
    { title: '喜欢的水果', name: 'favorites[1]' },
    { title: '联系人关系', name: 'relations[2].type' },
    { title: '联系人名称', name: 'relations[2].name' },
    { title: '标签', name: 'tags', render: <AdvancePicker mode="tags" /> },
    { title: '尺寸', name: 'size' },
  ];

  return (
    <AbstractObject
      action={action}
      record={record}
      onValuesChange={(a, b, c) => console.log(c)}
      onSubmit={(values) => console.log(values)}
      onCancel={() => console.log('取消编辑')}
    >
      <AbstractForm rules={rules} groups={groups} />
    </AbstractObject>
  );
}