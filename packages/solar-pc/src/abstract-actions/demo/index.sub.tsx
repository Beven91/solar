import React, { useState } from 'react';
import { AbstractActions, AbstractForm, SubmitAction, AbstractTable, AbstractButtons, AbstractColumns } from 'fluxy-pc';
import { AbstractAction, AbstractGroups, AbstractResponseModel, AbstractRules } from 'fluxy-pc/src/interface';
import { Button } from 'antd';

interface ActivityModel {
  id: number
  name: string
  price: number
}

interface CommodityModel {
  name: string
  code: string
}

const demo = [
  { id: 1, name: '满300减50', price: 300 },
];

// 这个组件推荐单独放到一个文件中，这里为了演示直观需要，直接写到此处。
function ActivityView(props: { addProduct: () => void }) {
  const rules: AbstractRules = {
    name: [{ required: true, message: '请填写活动名称' }],
    price: [{ required: true, message: '请设置活动价格' }],
  };

  const groups: AbstractGroups<ActivityModel> = [
    { title: '活动名称', name: 'name' },
    { title: '价格', name: 'price' },
    { title: '商品', name: '', render: <Button type="primary" onClick={props.addProduct} >添加商品(子动作)</Button> },
  ];

  return (
    <AbstractForm rules={rules} groups={groups} />
  );
}

function CommodityPicker() {
  const rules: AbstractRules = {
    name: [{ required: true, message: '请填写商品名' }],
    code: [{ required: true, message: '请填写货号' }],
  };

  const groups: AbstractGroups<CommodityModel> = [
    { title: '商品名', name: 'name' },
    { title: '货号', name: 'code' },
  ];

  return (
    <AbstractForm rules={rules} groups={groups} />
  );
}


export default function App() {
  const [action, setAction] = useState<AbstractAction<ActivityModel>>({ id: '', action: '', model: {} as ActivityModel });
  const [subAction, setSubAction] = useState<string>('');
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
      case 'addproduct':
        alert('子动作提交'+JSON.stringify(item.model, null, 2));
        // 退出子动作
        setSubAction('');
        break;
    }
  };

  // 进入添加商品子动作
  const onAddProduct = () => {
    setSubAction('addproduct');
  };

  return (
    <AbstractActions
      model={action.model}
      action={action.action}
      subAction={subAction}
      onSubmit={onSubmit}
      addProduct={onAddProduct}
      onSubCancel={() => {
        setSubAction('');
      }}
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

      <AbstractActions.Object title="修改活动" width={500} action="update" use={ActivityView} />
      <AbstractActions.Object title="添加商品" width={600} subAction="addproduct" use={CommodityPicker} />

    </AbstractActions>
  );
}