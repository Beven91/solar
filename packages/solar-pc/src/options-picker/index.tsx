import React, { useContext } from 'react';
import ConfigProvider from '../abstract-provider';
import AdvancePicker, { AdvancePickerProps } from '../advance-picker';

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
  return (
    <AdvancePicker
      {...others}
      type="local"
      api={(query) => context.fetchOption(optionsKey, query)}
    />
  );
}