import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups } from 'solar-pc';
import { Form, FormInstance } from 'antd';

export interface CommodityModel {
  name: string
  user?:{
    id:number
    age:number
  }
}

function NestedApp(props:{ value?:any, onChange?:(value:any)=>void }) {
  const groups: AbstractGroups<CommodityModel> = [
    { title: '编号', name: 'id' },
    { title: '年龄', name: 'age' },
  ];

  return (
    <AbstractForm.ISolation value={props.value} onChange={props.onChange} groups={groups} />
  );
}

export default function App() {
  const formRef = useRef<FormInstance>();
  const [record] = useState<CommodityModel>({
    name: 'AA',
  });

  const groups: AbstractGroups<CommodityModel> = [
    { title: '名称', name: 'name' },
    { title: '', name: 'user', render: <NestedApp /> },
  ];

  const onValuesChange= (values:CommodityModel, previous:CommodityModel)=>{
    console.log({ ...previous, values });
  };

  return (
    <Form onValuesChange={onValuesChange} initialValues={record} ref={formRef}>
      <AbstractForm model={record} groups={groups} form={formRef} />
    </Form>
  );
}