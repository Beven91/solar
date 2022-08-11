import React, { useContext } from 'react';
import ConfigProvider from '../abstract-provider';
import AdvancePicker, { AdvancePickerProps } from '../advance-picker';
import { PageQueryData } from '../interface';

type AdvancePickerFilterdProps = Omit<AdvancePickerProps<any>, 'data' | 'api' | 'type' | 'query'>

interface OptionsPickerProps extends AdvancePickerFilterdProps {
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
      api={(query) => fetchOptions(query)}
    />
  );
}