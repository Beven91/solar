import React, { useState } from 'react';
import { AbstractActions, AbstractForm, SubmitAction, AbstractTable, AbstractButtons, AbstractColumns } from 'fluxy-pc';
import { AbstractAction, AbstractGroups, AbstractResponseModel, AbstractRules } from 'fluxy-pc/src/interface';

interface ActivityModel {
  id: number
  name: string
  price: number
}

const demo = [
  { id: 1, name: '满300减50', price: 300 },
];

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
      case 'update':
        const current = data.models.find((m) => m.id == item.model.id);
        const index = data.models.indexOf(current);
        data.models[index] = {
          ...current,
          ...item.model,
        };
        setRows({
          count: data.models.length,
          models: [
            ...data.models,
          ],
        });
        // 退出动作
        setAction({ action: '', id: '' });
        break;
    }
  };

  // 这里为了演示方便自定义个history 如果你是使用react-router-dom
  // 则可以直接  const history = useHistory();
  const history = {
    push(url: string) {
      console.log('push:', url);
      // 这里为了演示方便，直接调用函数
      // setAction({ action: 'update', id: '' });
    },
    replace(url: string) {
      console.log('replace:', url);
    },
    goBack() {
      console.log('goback');
    },
  };

  // 如果您使用的是react-router-dom 则可以使用
  // const route = useRouteMatch();
  const route = {
    path: 'demo/:action/:id',
    params: {
      id: '2',
      action: 'update',
    },
  };

  return (
    <AbstractActions
      route={route}
      history={history}
      model={action.model}
      action={action.action}
      onSubmit={onSubmit}
      style={{ height: 300 }}
      onRoute={(action) => setAction(action)}
      primaryKey="id"
      onCancel={() => setAction({ action: '', id: '' })}
    >
      <AbstractActions.List>
        <AbstractTable
          columns={columns}
          data={data}
          buttons={buttons}
          rowKey="id"
        />
      </AbstractActions.List>

      <AbstractActions.Object title="修改活动" width={500} action="update" use={ActivityView} />

    </AbstractActions>
  );
}