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

export default class $componentName$Record extends React.Component<$componentName$RecordProps> {
  // 校验规则
  get rules(): AbstractRules {
    return {
      /* GENERATE-EDIT-RULES */
    };
  }

  // 表单
  get groups(): AbstractGroups<RecordModel> {
    return [
      /* GENERATE-EDIT-FORMS */
    ];
  }

  // 渲染
  render() {
    return (
      <AbstractForm
        rules={this.rules}
        groups={this.groups}
      />
    );
  }
}
