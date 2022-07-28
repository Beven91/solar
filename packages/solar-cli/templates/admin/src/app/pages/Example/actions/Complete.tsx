/**
 * @module 演示：完成项目
 */
import React from 'react';
import { Input, Alert } from 'antd';
import { AbstractForm } from 'solar-pc';
import { RecordModel } from '../model';
import { AbstractGroups, AbstractRules, RecordViewProps } from 'solar-pc/src/interface';

export default function CompleteView(props: RecordViewProps<RecordModel>) {
  // 校验规则
  const rules: AbstractRules = {
    remark: [{ required: true, message: '请输入备注' }],
  };

  // 表单
  const groups: AbstractGroups<RecordModel> = [
    { title: '项目名', name: 'name', render: (row: any) => <span>{row.name}</span> },
    { title: '完成备注', name: 'remark', render: <Input.TextArea /> },
  ];

  return (
    <div>
      <Alert type="warning" message="项目开发完成报告，请输入详细报告备注后进行提交。" />
      <AbstractForm rules={rules} groups={groups} />
    </div>
  );
}

