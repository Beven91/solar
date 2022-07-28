/**
 * @module 对象编辑页
 * @description 可用于修改，新增，查看。
 */
import React from 'react';
import { InputNumber, DatePicker, Switch } from 'antd';
import { AbstractForm } from 'solar-pc';
import { RecordModel } from '../model';
import { AbstractGroups, AbstractRules, RecordViewProps } from 'solar-pc/src/interface';


export default function RecordView(props: RecordViewProps<RecordModel>) {
  // 校验规则
  const rules: AbstractRules = {
    activityId: [{ required: true, message: '请输入活动编号' }],
    batchNo: [{ required: true, message: '请输入批次号' }],
    couponFee: [{ required: true, message: '请输入优惠金额' }],
    couponSn: [{ required: true, message: '请输入优惠券码' }],
    couponTemplateId: [{ required: true, message: '请输入模板编号' }],
    couponType: [{ required: true, message: '请输入优惠券类型' }],
    minTradeAmount: [{ required: true, message: '请输入最低订单金额' }],
    source: [{ required: true, message: '请选择来源' }],
    subject: [{ required: true, message: '请输入主题名' }],
    validateEndTime: [{ required: true, message: '请选择有效期' }],
    validateStartTime: [{ required: true, message: '请输入validateStartTime' }],
  };

  // 表单
  const groups: AbstractGroups<RecordModel> = [
    {
      group: '基础信息',
      items: [
        { title: '活动编号', name: 'activityId' },
        { title: '批次号', name: 'batchNo' },
        { title: '模板编号', name: 'couponTemplateId' },
        { title: '优惠金额', name: 'couponFee', render: <InputNumber /> },
        { title: '优惠券码', name: 'couponSn' },
        { title: '最低订单金额', name: 'minTradeAmount', render: <InputNumber /> },
        { title: '是否锁定', name: 'isLock', initialValue: true, render: <Switch /> },
      ],
    },
    {
      group: '配置信息',
      span: 8,
      items: [
        { title: '主题', name: 'subject' },
        { title: '开始时间', name: 'useTime', render: <DatePicker /> },
        { title: '截止时间', name: 'validateStartTime' },
        { title: '使用用户', name: 'useUserId' },
      ],
    },
  ];

  return <AbstractForm rules={rules} groups={groups} />;
}
