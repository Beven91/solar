import React from 'react';
import { AbstractMenu } from 'solar-pc';
import { AbstractMenuType } from '../../interface';

export default function App() {
  const initSysMenus = () => {
    return Promise.resolve([
      {
        title: '订单管理',
        key: 'orders',
        children: [
          {
            title: '出库管理',
            key: 'smc',
            href: '#/smc/list',
          },
          {
            title: '物流管理',
            key: 'wms',
            href: '#/wms/list',
          },
        ],
      },
      {
        title: '商品管理',
        key: 'products',
        children: [
          {
            title: '库存管理',
            key: 'stock',
            href: '#/stock/list',
          },
          {
            title: '条码管理',
            key: 'sku',
            href: '#/sku/list',
          },
        ],
      },
      {
        title: '系统',
        key: 'system',
        children: [
          {
            title: '虚拟管理',
            key: 'vi',
            virtual: true,
            href: '#/stock/list',
          },
        ],
      },
    ] as AbstractMenuType[]);
  };

  return (
    <div style={{ width: 300 }}>
      <AbstractMenu
        loadMenus={initSysMenus}
      />
    </div>
  );
}