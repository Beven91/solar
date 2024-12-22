import React, { useState } from 'react';
import { OverridePageHeader } from 'solar-pc';
import { Button } from 'antd';

export function PageView(props: React.PropsWithChildren) {
  return (
    <div className="my-page">
      {/* 3. 假设当前页面需要覆盖默认的pageHeader配置时，可以按照如下进行覆写 */}
      <OverridePageHeader
        title="覆盖标题"
        subTitle="子标题信息..."
        appendRoutes={[{ path: '', title: '详细设置' }]}
      />
      <div>
        正文内容
        {props.children}
      </div>
    </div>
  );
}

export default function OverridablePageHeaderDemoApp() {
  const routes = [
    { path: '', title: '系统设置' },
    { path: '', title: '角色配置' },
  ];

  const [visible, setVisible] = useState(false);

  return (
    // 1.设置可覆写的范围，本质就是React的Context.Provider
    <OverridePageHeader.Container>
      <div>
        logo
        {/* 2. 实际PageHeader要展示的位置 */}
        <OverridePageHeader.PageHeader
          title="默认标题"
          breadcrumb={{ items: routes }}
        />
      </div>
      <div>
        <Button type="link" onClick={() => setVisible(true)}>进入子页面</Button>
      </div>
      <div style={{ padding: 40 }}>
        {
          visible && (
            <PageView>
              <Button type="link" onClick={() => setVisible(false)}>返回</Button>
            </PageView>
          )
        }
      </div>
    </OverridePageHeader.Container>
  );
}