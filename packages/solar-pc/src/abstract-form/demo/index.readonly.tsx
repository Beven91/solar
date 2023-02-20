import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups, AdvancePicker } from 'solar-pc';
import { Form, FormInstance, InputNumber, Switch, DatePicker, Slider } from 'antd';

export interface CommodityModel {
  name: string
  color: string
  size: string
  [x: string]: any
}

const COUPONS_TYPES = [
  { value: 1, label: '满减优惠券' },
  { value: 2, label: '折扣优惠券' },
  { value: 3, label: '抵扣优惠券' },
];

export default function App() {
  const formRef = useRef<FormInstance>();
  const [readonly, setReadonly] = useState(true);
  const [bottom, setBottom] = useState(0);
  const [record] = useState<CommodityModel>({
    name: 'Surface Book3',
    color: 'Black',
    size: '13.7',
    activityId: 'AS0222234',
    couponType: 1,
    isVisual: true,
    code: 'AD0009',
    validateStartTime: '2011-01-09 10:20:20',
  });

  const groups: AbstractGroups<CommodityModel> = [
    { title: '最大值', initialValue: 200, name: 'max', render: <InputNumber />, extra: '带初始值' },
    { title: '活动编号', name: 'activityId', extra: '默认为文本输入框' },
    { title: '优惠券类型', name: 'couponType', render: <AdvancePicker data={COUPONS_TYPES} /> },
    { title: '可视化', name: 'isVisual', render: <Switch /> },
    {
      title: '模板编码',
      name: 'code',
      initialValue: '001',
      disabled: (row) => true,
      extra: '设置disabled配置来禁用表单',
    },
    {
      title: '截止时间',
      name: 'validateStartTime',
      convert: () => 'moment',
      render: <DatePicker />,
      extra: '例如：像DatePicker会返回moment，如果希望返回成日期字符串，则可以设置convert参数来指定转换器',
    },
  ];

  const style = bottom > 0 ? { marginBottom: bottom } : undefined;

  return (
    <Form initialValues={record} ref={formRef}>
      <Form.Item
        label="是否只读"
      >
        <Switch checked={readonly} onChange={setReadonly} />
      </Form.Item>
      <Form.Item
        label="下间距"
      >
        <Slider value={bottom} onChange={setBottom} min={0} max={30} />
      </Form.Item>
      <AbstractForm itemStyle={style} model={record} isReadOnly={readonly} groups={groups} form={formRef} />

    </Form>
  );
}