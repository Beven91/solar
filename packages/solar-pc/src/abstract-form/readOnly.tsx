import React, { useContext } from 'react';
import { AbstractFormItemType, AbstractRow } from '../interface';
import { Tooltip, ConfigProvider } from 'antd';

export interface ReadOnlyProps {
  value: any
  item: AbstractFormItemType<AbstractRow>
}

export default function ReadOnly(props: ReadOnlyProps) {
  const { value, item } = props;
  const context = useContext(ConfigProvider.ConfigContext);
  const out = (value === undefined || value === null) ? '' : value;
  return (
    item.tooltip ?
      (
        <Tooltip placement="topLeft" title={value}>
          <div className="readonly-form ellipsis">
            {String(out)}
          </div>
        </Tooltip>
      ) :
      (
        <div className={`readonly-form-item ${context.getPrefixCls('input')}`}>
          {String(out)}
        </div>
      ));
}
