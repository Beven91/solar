import React, { useContext, useEffect, useState } from 'react';
import ConfigProvider from '../abstract-provider';
import AdvancePicker, { AdvancePickerProps } from '../advance-picker';
import { PageQueryData } from '../interface';

const cache: Record<string, Promise<Record<string, string>>> = {};

export interface OptionsViewProps {
  optionsKey: string
  value: string
  labelName?: string
  valueName?: string
  style?: React.CSSProperties
}

export type AdvancePickerFilterdProps = Omit<AdvancePickerProps<any, any>, 'data' | 'api' | 'type' | 'query'>

export interface OptionsPickerProps extends AdvancePickerFilterdProps {
  /**
   * 字典名称
   */
  optionsKey: string
}

export default function OptionsPicker(props: OptionsPickerProps) {
  const { optionsKey, ...others } = props;
  const context = useContext(ConfigProvider.Context);

  const fetchOptions = (query: PageQueryData) => {
    if (!optionsKey) {
      return Promise.resolve({ count: 0, models: [] });
    }
    return context.fetchOption(optionsKey, query);
  };

  return (
    <AdvancePicker
      {...others}
      type="local"
      key={props.optionsKey}
      api={(query) => fetchOptions(query)}
    />
  );
}

export function OptionsView({ labelName = 'label', valueName = 'value', value, optionsKey, ...props }: OptionsViewProps) {
  const context = useContext(ConfigProvider.Context);
  const [options, setModels] = useState<Record<string, string>>({});

  const fetchOptions = async() => {
    if (!optionsKey) return;
    if (!cache[optionsKey]) {
      cache[optionsKey] = context.fetchOption(optionsKey, { pageNo: 0, pageSize: 1000 }).then((res)=>{
        const values = {} as Record<string, string>;
        res.models.forEach((item: Record<string, string>) => {
          values[item[valueName]] = item[labelName];
        });
        return values;
      }).catch((ex)=>{
        delete cache[optionsKey];
        return {};
      });
    }
    const values = await Promise.resolve(cache[optionsKey]);
    setModels(values || {});
  };

  useEffect(() => {fetchOptions();}, [optionsKey, value]);

  return (
    <span style={props.style}>{options[value]}</span>
  );
}

OptionsPicker.OptionsView = OptionsView;