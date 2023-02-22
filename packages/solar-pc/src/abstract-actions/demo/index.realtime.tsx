import React, { useState } from 'react';
import { AbstractActions, AbstractForm, SubmitAction, AbstractTable, AbstractButtons, AbstractColumns } from 'fluxy-pc';
import { AbstractAction, AbstractGroups, AbstractResponseModel, AbstractRules } from 'fluxy-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
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
  ];

  const buttons: AbstractButtons<ActivityModel> = [
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

  const enterAction = (info: AbstractAction<ActivityModel>) => {
    const row = data.models.find((m) => m.id == Number(info.id));
    setAction({ id: info.id, action: info.action, model: row });
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
          onActionRoute={enterAction}
        />
      </AbstractActions.List>

      <AbstractActions.Drawer realtime title="修改活动" width={500} action="update" use={ActivityView} />

    </AbstractActions>
  );
}