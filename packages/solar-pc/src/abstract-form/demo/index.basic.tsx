import React, { useRef } from 'react';
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

export default function App() {
  const formRef = useRef<FormInstance>();

  const rules: AbstractRules = {
    activityId: [{ required: true, message: '请输入活动编码' }],
    couponType: [{ required: true, message: '请输入优惠券类型' }],
  };

  const groups: AbstractGroups<ActivityModel> = [
    { title: '最大值', initialValue: 200, name: 'max', render: <InputNumber />, extra: '带初始值' },
    { title: '活动编号', name: 'activityId', extra: '默认为文本输入框' },
    { title: '用户名称', name: 'user.name', extra: '多级属性例如: user.name' },
    { title: '用户年龄', name: 'user.age', extra: '多级属性例如: user.age' },
    { title: '优惠券类型', name: 'couponType', render: <AdvancePicker data={COUPONS_TYPES} /> },
    {
      title: '优惠券ID',
      name: 'couponID',
      format: (row) => (row.couponType || '') + '_0002',
      extra: '通过制定format，可以指定表单值生成',
    },
    {
      title: '券设计',
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
    { title: '可视化', name: 'isVisual', render: <Switch /> },
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
    { title: '优惠码', name: 'salerCode' },
    {
      title: '截止时间',
      name: 'validateStartTime',
      convert: () => 'moment',
      render: <DatePicker />,
      extra: '例如：像DatePicker会返回moment，如果希望返回成日期字符串，则可以设置convert参数来指定转换器',
    },
  ];

  return (
    <Form
      onFinish={(values) => console.log(values)}
      ref={formRef}
    >
      <AbstractForm autoFocus="activityId" groups={groups} rules={rules} form={formRef} />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}