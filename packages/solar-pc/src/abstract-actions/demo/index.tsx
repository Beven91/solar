import React, { useState } from 'react';
import { AbstractActions, AbstractForm, SubmitAction, AbstractTable, AbstractButtons, AbstractColumns } from 'solar-pc';
import { AbstractAction, AbstractGroups, AbstractResponseModel, AbstractRules } from 'solar-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
  size?: string
}

// 这个组件推荐单独放到一个文件中，这里为了演示直观需要，直接写到此处。
function ActivityView() {
  const rules: AbstractRules = {
    name: [{ required: true, message: '请填写活动名称' }],
    price: [{ required: true, message: '请设置活动价格' }],
  };

  const groups: AbstractGroups<ActivityModel> = [
    { title: '活动名称', name: 'name' },
    { title: '价格', name: 'price' },
    { title: '尺寸', name: 'size', initialValue: 20 },
  ];

  return (
    <AbstractForm rules={rules} groups={groups} />
  );
}

const demo = [
  { id: 1, name: '满300减50', price: 300 },
];

export default function App() {
  const [action, setAction] = useState<AbstractAction<ActivityModel>>({ id: '', action: '', model: {} as ActivityModel });
  const [data, setRows] = useState<AbstractResponseModel<ActivityModel>>({ count: 0, models: demo });

  const columns: AbstractColumns<ActivityModel> = [
    { title: '活动名称', name: 'name' },
    { title: '活动价格', name: 'price' },
    { title: '尺寸', name: 'size' },
  ];

  const buttons: AbstractButtons<ActivityModel> = [
    { title: '新增活动', action: 'add' },
    { title: '修改', action: 'update', target: 'cell' },
  ];

  // 提交动作
  const onSubmit = (item: SubmitAction<ActivityModel>) => {
    switch (item.action) {
      case 'add':
        item.model.id = Date.now();
        data.models.push(item.model);
        break;
      case 'update':
        const current = data.models.find((m) => m.id == item.model.id);
        const index = data.models.indexOf(current);
        data.models[index] = {
          ...current,
          ...item.model,
        };
        break;
    }
    setRows({
      count: data.models.length,
      models: [
        ...data.models,
      ],
    });
    // 退出动作
    setAction({ action: '', id: '' });
  };

  return (
    <AbstractActions
      action={action.action}
      model={action.model}
      onSubmit={onSubmit}
      style={{ height: 300 }}
      primaryKey="id"
      onCancel={() => setAction({ action: '', id: '' })}
    >
      <AbstractActions.List>
        <AbstractTable
          columns={columns}
          data={data}
          buttons={buttons}
          rowKey="id"
          onActionRoute={setAction}
        />
      </AbstractActions.List>

      <AbstractActions.Popup title="新增活动" width={500} action="add" use={ActivityView} />
      <AbstractActions.Drawer title="修改活动" width={500} action="update" use={ActivityView} />

    </AbstractActions>
  );
}