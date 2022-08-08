import './index.scss';
import React from 'react';
import { AbstractTable, AbstractActions } from 'solar-pc';
import { PlusOutlined } from '@ant-design/icons';
import { store } from '$projectName$-provider';
import model, { ModelProps, RecordModel } from './model';
import Record from './actions/Record';
import Complete from './actions/Complete';
import { AbstractButtons, AbstractColumns, AbstractFilters, AbstractSFields } from 'solar-pc/src/interface';
import { useHistory, useRouteMatch } from 'react-router-dom';

function ExamplePageView(props:ModelProps) {
  // 列表搜索字段
  const searchFields: AbstractSFields= [
    { name: 'name', title: '名称' },
  ];

  // 过滤选项卡
  const filters: AbstractFilters ={
    name: 'status',
    tabs: [
      { label: '全部', value: '' },
      { label: '开发中', value: 1 },
      { label: '开发完毕', value: 2 },
    ],
  };

  // 列表字段
  const columns: AbstractColumns= [
    { title: '项目名', name: 'name' },
    { title: '日期', name: 'date', format: 'date' },
    { title: '创建人', name: 'creator' },
    { title: '描述', name: 'remark' },
  ];

  // 操作按钮
  const buttons: AbstractButtons<RecordModel> = [
    { title: '新增任务', icon: <PlusOutlined />, action: 'add' },
    // { name: '编辑', position: 'cell', click: hashAction('edit') },
    // { name: '查看', position: 'cell', click: hashAction('view') },
    // { name: '删除', position: 'cell', click: this.props.removeRecordAsync, confirm: '您确定要删除改项' },
    {
      title: '开发完成',
      target: 'cell',
      visible: row => row.status == 1,
      action: 'complete',
    },
  ];

  const history = useHistory();
  const match = useRouteMatch();
  const { model, idKey, action } = props;

  return (
    <AbstractActions
      route={match}
      history={history}
      action={action}
      model={model}
      primaryKey={idKey}
      className="example-module"
      onRoute={props.enterAction}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      confirmLoading={props.confirmLoading}
    >
      <AbstractActions.List>
        <AbstractTable
          rowKey={idKey}
          sort="code"
          order="descend"
          className="action-out-container"
          columns={columns}
          buttons={buttons}
          filters={filters}
          onQuery={props.queryAllAsync}
          data={props.allRecords}
          searchFields={searchFields}
        />
      </AbstractActions.List>
      <AbstractActions.Object title="新增" action="add" use={Record} />
      <AbstractActions.Popup title="报告" action="complete" use={Complete} width={600} />
    </AbstractActions>
  );
}

export default store.connect(model)(ExamplePageView);