import './index.scss';
import React from 'react';
import { AbstractTable, AbstractActions /* GENERATE-LIST-UI */ } from 'solar-pc';
import { PlusOutlined } from '@ant-design/icons';
import { /* GENERATE-LIST-ANT */ } from 'antd';/* GENERATE-CONSTANT */
import { store } from '$storeModule$';
import model, { ModelProps, RecordModel } from './model';
import Record from './actions/Record';
import { AbstractButtons, AbstractColumns, AbstractSFields } from 'solar-pc/src/interface';
import { useHistory, useRouteMatch } from 'react-router-dom';

function $componentName$PageView(props:ModelProps) {
  // 列表搜索字段
  const searchFields: AbstractSFields = [
    /* GENERATE-SEARCH */
  ];

  // 列表字段
  const columns: AbstractColumns<RecordModel> = [
    /* GENERATE-COLUMNS */
  ];

  // 操作按钮
  const buttons: AbstractButtons<RecordModel> = [
    { title: '新增', icon: <PlusOutlined />, action: 'add' },
    { title: '编辑', target: 'cell', action: 'update' },
    { title: '查看', target: 'cell', action: 'view' },
    // { title: '删除', target: 'cell', click: props.removeRecordAsync, confirm: '您确定要删除改项' },
  ];

  const { record, loading, idKey, action } = props;
  const history = useHistory();
  const match = useRouteMatch();

  return (
    <AbstractActions
      route={match}
      history={history}
      action={action}
      model={record}
      primaryKey={idKey}
      className="$className$"
      onRoute={props.enterAction}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      confirmLoading={props.confirmLoading}
    >
      <AbstractActions.List>
        <AbstractTable
          sort="code"
          order="descend"
          loading={loading}
          rowKey={idKey}
          columns={columns}
          buttons={buttons}
          // filters={this.filters}
          data={props.allRecords}
          searchFields={searchFields}
          onQuery={props.queryAllAsync as any}
        />
      </AbstractActions.List>
      $actionViews$
    </AbstractActions>
  );
}

export default store.connect(model)($componentName$PageView);
