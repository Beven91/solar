import React, { useRef } from 'react';
import { AbstractForm, AbstractGroups, AbstractRules } from 'solar-pc';
import { Button, Form, FormInstance } from 'antd';

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

const formLayout = {
  labelCol: {
    flex: `${120}px`,
    xs: { span: 24 },
  },
  wrapperCol: {
    flex: 1,
    xs: { span: 24 },
  },
};

const description = '澳门特区政府部门的公开微博发布了头条文章一个人在一起的时候我就不想去了吗，我就不想再去想了什么事了是的冯绍峰是的冯绍峰';

export default function App() {
  const formRef = useRef<FormInstance>();

  const rules: AbstractRules = {
    activityId: [{ required: true, message: '请输入活动编码' }],
    couponType: [{ required: true, message: '请输入优惠券类型' }],
  };

  const groups: AbstractGroups<ActivityModel> = [
    { title: '姓名', initialValue: '张三', name: 'name', textonly: true },
    { title: '描述', initialValue: description, name: 'desc', textonly: true },
  ];

  return (
    <Form
      onFinish={(values) => console.log(values)}
      ref={formRef}
    >
      <AbstractForm formItemLayout={formLayout} autoFocus="activityId" groups={groups} rules={rules} form={formRef} />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}