/**
 * @name RadioList
 * @description
 *      单选框列表
 */
import './index.scss';
import React, { useEffect, useState } from 'react';
import { CheckboxOptionType, Radio } from 'antd';
import { RadioGroupProps } from 'antd/lib/radio';
import { Network } from 'solar-core';

const network = new Network();

interface RadioOptionType extends Partial<CheckboxOptionType> {
  [propName: string]: any
}

export interface RadioListProps extends Omit<RadioGroupProps, 'options'> {
  // 数据源,如果设置了api参数，无需设置该参数。
  options?: RadioOptionType[]
  // 自定义数据获取，支持接口请求。
  api?: (() => Promise<RadioOptionType[]>) | string
  // 当前选中的值
  value?: string
  // 样式类名
  className?: string
  // 选项样式类名
  optionClassName?: string
  // 显示字段名
  labelName?: string
  // 值字段名称
  valueName?: string
  // 自定义样式
  style?: React.CSSProperties,
  // 布局方向
  direction?: 'horizon' | 'vertical'
}

export default function RadioList({ api, optionClassName, buttonStyle = 'solid', options, direction = 'horizon', labelName = 'label', valueName = 'value', ...props }: RadioListProps) {
  const [models, setModels] = useState(options || []);
  const fetchApiResponse = async() => {
    if (!api) return;
    const data = await (typeof api == 'function' ? api() : network.get<RadioOptionType[]>(api).json());
    setModels(data);
  };

  useEffect(() => {
    fetchApiResponse();
  }, [api]);

  return (
    <Radio.Group
      {...props}
      buttonStyle={buttonStyle}
      className={`radio-list ${props.className || ''} ${direction}`}
    >
      {
        models?.map((option, idx) => {
          return (
            <Radio
              key={idx}
              disabled={option.disabled}
              style={option.style}
              className={`radio-list-item ${optionClassName || ''}`}
              value={option[valueName]}
            >
              {option[labelName]}
            </Radio>
          );
        })
      }
    </Radio.Group>
  );
}