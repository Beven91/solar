import React from 'react';
import { AbstractFormItemType, AbstractRow } from '../interface';
import { Tooltip } from 'antd';

export interface ReadOnlyProps {
  value: any
  item: AbstractFormItemType<AbstractRow>
}

export default function ReadOnly(props: ReadOnlyProps) {
  const { value, item } = props;
  return (
    item.tooltip ?
      (
        <Tooltip placement="topLeft" title={value}>
          <div className="readonly-form ellipsis">
            {value}
          </div>
        </Tooltip>
      ) :
      (
        <div className="readonly-form-item ant-input">
          {value}
        </div>
      ));
}
