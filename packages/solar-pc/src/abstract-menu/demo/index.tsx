import React from 'react';
import { AbstractMenu } from 'solar-pc';
import { AbstractMenuType } from '../../interface';

export default function App() {
  const initSysMenus = () => {
    return Promise.resolve([
      {
        name: '订单管理',
        key: 'orders',
        children: [
          {
            name: '出库管理',
            key: 'smc',
            href: '#/smc/list',
          },
          {
            name: '物流管理',
            key: 'wms',
            href: '#/wms/list',
          },
        ],
      },
      {
        name: '商品管理',
        key: 'products',
        children: [
          {
            name: '库存管理',
            key: 'stock',
            href: '#/stock/list',
          },
          {
            name: '条码管理',
            key: 'sku',
            href: '#/sku/list',
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