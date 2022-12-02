import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups } from 'solar-pc';
import { Form, FormInstance, Button } from 'antd';

export interface CommodityModel {
  name: string
  user?:{
    id:number
    age:number
  }
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
    <Form onFinish={(d)=>console.log('finish', d)} onValuesChange={onValuesChange} initialValues={record} ref={formRef}>
      <AbstractForm rules={rules} model={record} groups={groups} form={formRef} />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}