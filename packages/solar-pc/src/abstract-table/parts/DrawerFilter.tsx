import React, { useMemo, useState } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { Drawer, DrawerProps } from 'antd';
import { AbstractSearchProps } from '../../abstract-search';

export interface DrawerFilterProps extends Omit<DrawerProps, 'open'> {
  search: (props?: Partial<AbstractSearchProps<any>>) => React.ReactNode
}

export default function DrawerFilter(props: React.PropsWithChildren<DrawerFilterProps>) {
  const [open, setOpen] = useState(false);
  const options = useMemo<Partial<AbstractSearchProps<any>>>(() => {
    return {
      formItemLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      span: 24,
      actionStyle: 'newline',
      onQuery: () => {
        setOpen(false);
      },
    };
  }, []);

  return (
    <>
      <FilterOutlined
        onClick={() => setOpen(true)}
        className="table-search-filter"
      />
      <Drawer
        title="搜索"
        {...props}
        open={open}
        className={`table-drawer-filter ${props.className || ''}`}
        onClose={() => setOpen(false)}
      >
        {props.search?.(options)}
      </Drawer>
    </>
  );
}