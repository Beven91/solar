import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups } from 'solar-pc';
import { Form, FormInstance } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
}

export default function App() {
  const formRef = useRef<FormInstance>();
  const [record] = useState<CommodityModel>({
    name: 'Surface Book3',
    color: 'Black',
    size: '13.7',
  });

  const groups: AbstractGroups<CommodityModel> = [
    { title: '商品名', name: 'name' },
    { title: '颜色', name: 'color' },
    { title: '尺寸', name: 'size' },
  ];

  return (
    <Form initialValues={record} ref={formRef}>
      <AbstractForm model={record} isReadOnly groups={groups} form={formRef} />
    </Form>
  );
}