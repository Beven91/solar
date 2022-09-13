import './actions/index.scss';
import React from 'react';
import { AbstractTable, AbstractActions } from 'solar-pc';
import { AdminPage } from '$projectName$-ui';
import { PlusOutlined } from '@ant-design/icons';
import { store } from '$projectName$-provider';
import model, { ModelProps } from './model';
import Record from './actions/Record';
import Complete from './actions/Complete';
import { AbstractButtons, AbstractColumns, AbstractFilters, AbstractSFields } from 'solar-pc/src/interface';

@store.connect(model)
export default class Example extends AdminPage<ModelProps> {
  // 列表搜索字段
  get searchFields(): AbstractSFields {
    return [
      { name: 'name', title: '名称' }
    ];
  }

  // 过滤选项卡
  get filters(): AbstractFilters {
    return {
      name: 'status',
      tabs: [
        { name: '全部', value: '' },
        { name: '开发中', value: 1 },
        { name: '开发完毕', value: 2 }
      ],
    };
  }

  // 列表字段
  get columns(): AbstractColumns {
    return [
      { title: '项目名', name: 'name' },
      { title: '日期', name: 'date', format: 'date' },
      { title: '创建人', name: 'creator' },
      { title: '描述', name: 'remark' },
    ];
  }

  // 操作按钮
  get buttons(): AbstractButtons {
    return [
      { name: '新增任务', icon: <PlusOutlined />, action: 'add' },
      // { name: '编辑', position: 'cell', click: hashAction('edit') },
      // { name: '查看', position: 'cell', click: hashAction('view') },
      // { name: '删除', position: 'cell', click: this.props.removeRecordAsync, confirm: '您确定要删除改项' },
      {
        name: '开发完成',
        target: 'cell',
        enable: row => row.status == 1,
        action: 'complete'
      },
    ];
  }

  render() {
    const { record, primaryKey, match, history, action } = this.props;
    return (
      <AbstractActions
        action={action}
        record={record}
        primaryKey={primaryKey}
        className="example-module"
        routeAction={match.params as any}
        onRoute={this.props.enterAction}
        onRouteBack={() => history.goBack()}
        onSubmit={this.props.onSubmit}
        onCancel={this.props.onCancel}
      >
        <AbstractActions.List>
          <AbstractTable
            rowKey={primaryKey}
            sort="code"
            order="descend"
            className="action-out-container"
            columns={this.columns}
            buttons={this.buttons}
            filters={this.filters}
            onActionRoute={(action) => history.push(action.create(match.path))}
            onQuery={this.props.queryAllAsync}
            data={this.props.allRecords}
            searchFields={this.searchFields}
          />
        </AbstractActions.List>
        <AbstractActions.Object title="新增" action="add" use={Record} />
        <AbstractActions.Popup title="报告" action="complete" use={Complete} width={600} />
      </AbstractActions>
    );
  }
}
