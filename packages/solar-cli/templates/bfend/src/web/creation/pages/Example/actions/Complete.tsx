/**
 * @module Complete
 * @description 开发完成填写
 */
import React from 'react';
import { Input, Alert } from 'antd';
import { AbstractForm } from 'solar-pc';

export default class Complete extends React.Component {
  // 校验规则
  rules = {
    remark: [{ required: true, message: '请输入备注' }],
  };

  // 表单
  groups = [
    { title: '项目名', name: 'name', render: (row: any) => <span>{row.name}</span> },
    { title: '完成备注', name: 'remark', render: <Input.TextArea /> },
  ];

  // 渲染
  render() {
    return (
      <div>
        <Alert type='warning' message='项目开发完成报告，请输入详细报告备注后进行提交。' />
        <AbstractForm rules={this.rules} groups={this.groups} />
      </div>
    );
  }
}
