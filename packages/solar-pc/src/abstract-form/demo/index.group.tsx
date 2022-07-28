import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups, AbstractRules, RadioList } from 'solar-pc';
import { Form, FormInstance } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

export interface CommodityModel {
  name: string
}

export default function App() {
  const formRef = useRef<FormInstance>();
  const [groupStyle, setGroupStyle] = useState<any>('normal');

  const rules: AbstractRules = {
    activityId: [{ required: true, message: '请输入活动编码' }],
    couponType: [{ required: true, message: '请输入优惠券类型' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    {
      group: '基本信息',
      span: 12,
      items: [
        { title: '商品名', name: 'name', initialValue: 'Surface Book3' },
        { title: '颜色', name: 'color', initialValue: 'Black' },
        { title: '尺寸', name: 'size', initialValue: '13.7' },
      ],
    },
    {
      group: '条码配置',
      items: [
        { title: '条码信息', name: 'skuId', initialValue: '2000000012341' },
        { title: '条码信息', name: 'skuId2' },
      ],
    },
  ];

  return (
    <Form ref={formRef}>
      <AbstractForm groupStyle={groupStyle} groups={groups} rules={rules} form={formRef} />
      <div style={{ marginTop: 40 }}>
        <FormItem label="分组样式" >
          <RadioList
            value={groupStyle}
            onChange={(e) => setGroupStyle(e.target.value)}
            options={[
              { label: 'normal', value: 'normal' },
              { label: 'gap', value: 'gap' },
            ]}
          />
        </FormItem>
      </div>
    </Form>
  );
}