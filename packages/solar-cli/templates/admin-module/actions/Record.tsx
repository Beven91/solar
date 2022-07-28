/**
 * @module $componentName$Record
 * @description 单个对象新增，修改，查看视图
 */
import React from 'react';
import { /* GENERATE-EDIT-ANT */ } from 'antd';
import { AbstractForm /* GENERATE-EDIT-UI */ } from 'solar-pc';/* GENERATE-EDIT-CONSTANT */
import { AbstractGroups, AbstractRules, RecordViewProps } from 'solar-pc/src/interface';
import { RecordModel } from '../model';

export interface $componentName$RecordProps extends RecordViewProps<RecordModel> {
}

export default function $componentName$Record(props: $componentName$RecordProps) {
  // 校验规则
  const rules: AbstractRules = {
    /* GENERATE-EDIT-RULES */
  };

  // 表单
  const groups: AbstractGroups<RecordModel> = [
    /* GENERATE-EDIT-FORMS */
  ];

  // 渲染
  return (
    <AbstractForm
      rules={rules}
      groups={groups}
    />
  );
}
