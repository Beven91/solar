import React from 'react';
import { OverridePageHeader } from 'solar-pc';

export function PageView() {
  return (
    <div className="my-page">
      {/* 3. 假设当前页面需要覆盖默认的pageHeader配置时，可以按照如下进行覆写 */}
      <OverridePageHeader title="覆盖标题" subTitle="子标题信息..." />
      <div>
        正文内容
      </div>
    </div>
  );
}

export default function OverridablePageHeaderDemoApp() {
  const routes = [
    { path: '', breadcrumbName: '系统设置' },
    { path: '', breadcrumbName: '角色配置' },
  ];

  return (
    // 1.设置可覆写的范围，本质就是React的Context.Provider
    <OverridePageHeader.Container>
      <div>
        {/* 2. 实际PageHeader要展示的位置 */}
        <OverridePageHeader.PageHeader
          title="默认标题"
          breadcrumb={{ routes }}
        />
      </div>
    </OverridePageHeader.Container>
  );
}