import './index.scss';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import RemoteIconView from './RemoteIconView';
import { Input, Popover } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

export interface IconPickerProps {
  // 字体图片url
  value?: string
  // 当选择改变时触发
  onChange?: (url: string) => void
  // 是否禁用
  disabled?: boolean
  placeholder?: string
}

export interface IconPickerState {
  url: string
}

export default function IconPicker(props: IconPickerProps) {
  const inputRef = useRef<any>();
  const [url, setUrl] = useState(props.value);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = props;
    onChange && onChange(e.target.value);
  };

  useEffect(() => {
    setUrl(props.value);
  }, [props.value]);


  const popover = (
    <Popover
      trigger="click"
      title="图标库"
      placement="bottom"
      content={<RemoteIconView url={url} />}
    >
      <EyeOutlined />
    </Popover>
  );

  return (
    <Input
      ref={inputRef}
      value={props.value}
      onBlur={() => {
        if (inputRef.current.state) {
          setUrl(inputRef.current.state.value);
        }
      }}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={onChange}
      addonAfter={popover}
    />
  );
}