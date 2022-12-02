import { Input } from 'antd';
import React from 'react';
import { AbstractForm, AbstractObject, AdvancePicker } from 'solar-pc';
import { AbstractGroups, AbstractRules } from 'solar-pc/src/interface';

const apps = [
  { label: '太医管家', value: 'FAMILY_DOCTOR' },
  { label: '身边太医', value: 'WEIAPP' },
  { label: '太医健康馆', value: 'EXPERIENCE_WEIAPP' },
  { label: '太医在身边', value: 'DOCTOR_HEALTH' },
  { label: '广慈用户端', value: 'GC_CPIC_HOSPITAL' },
];

interface PageModel {
  appType: string
  url: string
  query: string
}

export default class MiniprogramDemo extends React.Component {
  state = {
    visible: false,
    url: '',
    record: {} as PageModel,
  };

  // 校验规则
  rules: AbstractRules = {
    appType: [{ required: true, message: '请选择要生成的小程序' }],
    url: [{ required: true, message: '请输入要跳转的地址' }],
  };

  // 表单
  get groups(): AbstractGroups<PageModel> {
    return [
      { title: '', name: 'appType', render: <AdvancePicker placeholder="请选择小程序" type="local" data={apps} /> },
      {
        title: '',
        name: 'url',
        render: <Input.TextArea placeholder="例如: https://h5.shantaijk.cn/xxx 或者 /pages/home/index" rows={4} />,
      },
      {
        title: '',
        name: 'query',
        render: <Input.TextArea placeholder="参数,例如: id=xx&name=xxx" />,
      },
    ];
  }

  onSubmit = (values: PageModel) => {
    const url = encodeURIComponent(values.url?.replace(/\n/g, '').trim());
    const query = values.query?.trim().replace(/\n/g, '');
    this.setState({
      visible: true,
      url: `https://h5.shantaijk.cn/tahiti/sun-code-guide.html?url=${url}&type=${values.appType}&query=${query}`,
    });
  };

  render(): React.ReactNode {
    return (
      <div>
        <AbstractObject
          action="add"
          showActions="ok"
          className="abstract-object-demo"
          record={this.state.record}
          onSubmit={this.onSubmit}
        >
          <AbstractForm
            rules={this.rules}
            groups={this.groups}
          />
        </AbstractObject>
        {
          !this.state.visible ? null : (
            <iframe style={{ height: '1200px', width: '100%' }} frameBorder="no" src={this.state.url}></iframe>
          )
        }
      </div>
    );
  }
};