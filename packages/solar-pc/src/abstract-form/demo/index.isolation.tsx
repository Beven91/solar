import React, { useContext, useEffect, useRef, useState } from 'react';
import { AbstractForm, AbstractGroups, AbstractTableInput } from 'solar-pc';
import { Form, FormInstance, Button, Input } from 'antd';
import { AbstractEColumns } from '../../interface';

export interface CommodityModel {
  name: string
  user?: {
    id: number
    age: number
  }
}

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  age: [{ required: true, message: '请设置年龄' }],
  like: [{ required: true, message: '爱好不能为空' }],
};

function NestedApp(props: { value?: any, onChange?: (value: any) => void }) {
  const columns: AbstractEColumns<any> = [
    {
      name: 'like', title: '爱好', editor: () => {
        return <Input />;
      },
    },
  ];
  const groups: AbstractGroups<CommodityModel> = [
    { title: '编号', name: 'id', initialValue: 200 },
    { title: '信息', name: 'info', render: <AbstractTableInput rules={rules} columns={columns} /> },
    { title: '年龄', name: 'age' },
  ];

  return (
    <>
      <Form.Item label="联动值">
        {props.value?.info?.[0]?.like}
      </Form.Item>
      <AbstractForm.ISolation rules={rules} value={props.value} onChange={props.onChange} groups={groups} />
    </>
  );
}

const MergeRuleInput: React.FC = (props: { value: string, onChange: () => void }) => {
  const ctx = useContext(AbstractForm.ISolation.Context);

  useEffect(() => {
    return ctx.addMergeValidator(() => {
      return props.value == '111' ? Promise.reject('输入值不能为:111') : Promise.resolve();
    });
  });

  return (
    <Input onChange={props.onChange} value={props.value} />
  );
};

export default function App() {
  const formRef = useRef<FormInstance>();
  const [record] = useState<CommodityModel>({
    name: 'AA',
  });

  const groups: AbstractGroups<CommodityModel> = [
    { title: '名称', name: 'name', extra: (r) => r.name },
    { title: '合并型号', name: 'input', render: <MergeRuleInput />, extra: '输入111触发mergeValidator' },
    { title: '', name: 'user', render: <NestedApp /> },
  ];

  const onValuesChange = (values: CommodityModel, previous: CommodityModel) => {
    console.log({ ...previous, ...values });
  };

  return (
    <Form
      onFinish={(d) => console.log('finish', d)}
      onValuesChange={onValuesChange}
      initialValues={record}
      ref={formRef}
      onFinishFailed={(e) => {
      }}
    >
      <AbstractForm rules={rules} model={record} groups={groups} />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}