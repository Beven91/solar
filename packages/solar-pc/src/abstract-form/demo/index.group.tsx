import React, { useRef, useState } from 'react';
import { AbstractForm, AbstractGroups, AbstractRules, RadioList } from 'solar-pc';
import { Button, Form, FormInstance, Input, Switch, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

export interface CommodityModel {
  name: string
  hideSku: boolean
}

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  age: [{ required: true, message: '请设置年龄' }],
};

function NestedApp(props: { disabled?: boolean, value?: any, onChange?: (value: any) => void }) {
  const groups: AbstractGroups<CommodityModel> = [
    { title: '编号', name: 'id', initialValue: '2' },
    { title: '年龄', name: 'age' },
  ];

  return (
    <AbstractForm.ISolation isReadOnly={props.disabled} rules={rules} value={props.value} onChange={props.onChange} groups={groups} />
  );
}

export default function App() {
  const formRef = useRef<FormInstance>();
  const [groupStyle, setGroupStyle] = useState<any>('tabs');

  const rules: AbstractRules = {
    name: [{ required: true, message: '商品名称不能为空' }],
    // skuId: [{ required: true, message: '请设置条码' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    {
      group: '基本信息',
      span: 12,
      items: [
        { title: '商品名', name: 'name', initialValue: '', render: <Input /> },
        { title: '价格', name: 'price', initialValue: '100.0', textonly: true },
        { title: '颜色', name: 'color', initialValue: 'Black', break: true },
        { title: '尺寸', name: 'size', initialValue: '13.7', disabled: true },
        { title: '品牌', name: 'brand', initialValue: 'Black', break: true },
        { title: '厂商', name: 'marker', initialValue: '13.7' },
        { title: '关闭条码', name: 'hideSku', initialValue: true, render: <Switch /> },
      ],
    },
    {
      group: '条码配置',
      visible: (r)=>{
        console.log(r.hideSku);
        return r.hideSku !== true;
      },
      items: [
        { title: '条码信息', name: 'skuId', initialValue: 'aaa' },
        { title: '条码信息', name: 'skuId2' },
        { title: '', name: 'sku', render2: <NestedApp /> },
      ],
    },
    {
      group: '库存配置',
      readonly: true,
      items: [
        { title: '数量', name: 'num', initialValue: '' },
        { title: '预警库存数', name: 'num2' },
      ],
    },
  ];

  return (
    <Form onFinish={() => message.success('已提交')} ref={formRef}>
      <AbstractForm groupStyle={groupStyle} groups={groups} rules={rules} />
      <div style={{ marginTop: 40 }}>
        <FormItem label="分组样式" >
          <RadioList
            value={groupStyle}
            onChange={(e) => setGroupStyle(e.target.value)}
            options={[
              { label: 'normal', value: 'normal' },
              { label: 'gap', value: 'gap' },
              { label: 'tabs', value: 'tabs' },
            ]}
          />
        </FormItem>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" >提交</Button>
      </div>
    </Form>
  );
}