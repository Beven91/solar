import React, { useRef, useState } from 'react';
import { AbstractForm, AdvancePicker, AbstractGroups, AbstractRules } from 'solar-pc';
import { Button, Form, FormInstance, InputNumber, Input, Switch, DatePicker } from 'antd';

export interface ActivityModel {
  activityId: string
  max: string
  couponType: number
  isVisual: boolean
  salerId: number
  couponId: string
  salerCode: string
  provCode: string
  provName: string
  visual: {
    name: string
  }
  user: {
    name: string
  }
}

const COUPONS_TYPES = [
  { value: 1, label: '满减优惠券' },
  { value: 2, label: '折扣优惠券' },
  { value: 3, label: '抵扣优惠券' },
];

const SALERS = [
  { value: 1, label: '云中君' },
  { value: 2, label: '少司命' },
];

const PROV = [
  { value: 1, label: '湖南省' },
  { value: 2, label: '湖北省' },
];

const CITY = [
  { value: 1, label: '北京市' },
  { value: 2, label: '上海市' },
];

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  age: [{ required: true, message: '请设置年龄' }],
};

function NestedApp(props: { value?: any, onChange?: (value: any) => void }) {
  const [name, setName] = useState();
  const groups: AbstractGroups<any> = [
    {
      title: '编号',
      name: 'id',
      initialValue: 200,
      onChange: (v) => setName(v),
    },
    { title: '年龄', name: 'age' },
    {
      title: '动态',
      name: 'dynamic',
      render: () => <div>{name}</div>,
    },
  ];

  return (
    <AbstractForm.ISolation rules={rules} value={props.value} onChange={props.onChange} groups={groups} />
  );
}

export default function App() {
  const formRef = useRef<FormInstance>();
  const [name, setName] = useState('');

  const rules: AbstractRules = {
    'activityId': [{ required: true, message: '请输入活动编码' }],
    'couponType': [{ required: true, message: '请输入优惠券类型' }],
    'visual.name': [{ required: true, message: '请输入可视化名称' }],
  };

  const groups: AbstractGroups<ActivityModel> = [
    { title: '最大值', initialValue: 200, name: 'max', render: <InputNumber />, extra: '带初始值' },
    { title: '活动编号', name: 'activityId', extra: '默认为文本输入框' },
    {
      title: '用户名称',
      name: 'user.name',
      extra: '多级属性例如: user.name',
      onChange: (v) => {
        setName(v);
      },
    },
    {
      title: '',
      name: 'iso',
      render2: <NestedApp />,
    },
    {
      title: '用户年龄',
      name: 'user.age',
      extra: '多级属性例如: user.age',
    },
    { title: '优惠券类型', name: 'couponType', render: <AdvancePicker data={COUPONS_TYPES} /> },
    {
      title: '优惠券ID',
      name: 'couponID',
      format: (row) => (row.couponType || '') + '_0002',
      extra: '通过制定format，可以指定表单值生成',
    },
    {
      title: '券设计' + name,
      name: 'design',
      extra: '自定义render渲染函数',
      render: (row) => {
        switch (row.couponType) {
          case 1:
            return <InputNumber />;
          default:
            return <Input />;
        }
      },
    },
    {
      title: '可视化',
      name: 'isVisual',
      render: <Switch />,
      extra: (row) => row.activityId + '----',
    },
    { title: '可视化名称', name: 'visual.name', visible: (row) => row.isVisual, extra: '设置visible函数来控制组件是否可见' },
    {
      title: '模板编码',
      name: 'code',
      initialValue: '001',
      disabled: (row) => true,
      extra: '设置disabled配置来禁用表单',
    },
    {
      title: '营业员',
      name: 'saler',
      render: <AdvancePicker data={SALERS} />,
      extra: '通过cascade函数来配置表单联动修改',
      cascade: (value, model) => {
        return {
          salerCode: 'S_' + value,
        };
      },
    },
    { title: '优惠码', name: 'salerCode', extra: (r) => r.salerCode },
    {
      title: '截止时间',
      name: 'validateStartTime',
      convert: () => ['moment', 'YYYY年MM月DD日'],
      render: <DatePicker format="YYYY年MM月DD日" />,
      extra: '例如：像DatePicker会返回moment，如果希望返回成日期字符串，则可以设置convert参数来指定转换器',
    },
    {
      title: '省份',
      name: 'provCode',
      render: <AdvancePicker valueMode="object" data={PROV} />,
      cascade: (value) => {
        return {
          'provCode': value.value,
          'provName': value.label,
        };
      },
    },
    {
      title: '省份名称',
      name: 'provName',
    },
    {
      title: '派生表单',
      name: 'cityId',
      genericKeys: { cityId: 'value', cityName: 'label' },
      render: <AdvancePicker valueMode="object" data={CITY} />,
    },
    {
      title: '多级',
      name: 'address[0].name',
    },
  ];

  const onFill = () => {
    formRef.current.setFieldsValue({
      activityId: 'a0001',
      couponType: 1,
      cityId: 1,
      cityName: '北京市',
      address: [
        { name: 'sdfsf' },
      ],
    });
  };

  return (
    <Form
      onFinish={(values) => console.log(values)}
      ref={formRef}
    >
      <div
        style={{ textAlign: 'right' }}
      >
        <Button onClick={onFill} type="primary">填充</Button>
      </div>
      <AbstractForm autoFocus="activityId" groups={groups} rules={rules}/>
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}
