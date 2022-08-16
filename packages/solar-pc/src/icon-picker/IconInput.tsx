import './index.scss';
import React, { ChangeEvent } from 'react';
import RemoteIconView from './RemoteIconView';
import { Input, Popover } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

export interface IconPickerProps {
  // 字体图片url
  value?:string
  // 当选择改变时触发
  onChange?:(url:string)=>void
  // 是否禁用
  disabled?:boolean
  placeholder?:string
}

export interface IconPickerState {
  url:string
}

export default class IconPicker extends React.Component<IconPickerProps, IconPickerState> {
  state:IconPickerState = {
    url: '',
  };

  inputRef = React.createRef<any>();

  renderIconViewer() {
    const url = this.state.url || this.props.value;
    return (
      <RemoteIconView
        url={url}
      />
    );
  }

  renderPopover() {
    return (
      <Popover
        trigger="click"
        title="图标库"
        placement="bottom"
        content={this.renderIconViewer()}
      >
        <EyeOutlined />
      </Popover>
    );
  }

  onChange = (e:ChangeEvent<HTMLInputElement>)=>{
    const { onChange } = this.props;
    onChange && onChange(e.target.value);
  };

  render() {
    return (
      <Input
        ref={this.inputRef}
        value={this.props.value}
        onBlur={()=>this.setState({ url: this.inputRef.current.state.value })}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        onChange={this.onChange}
        addonAfter={this.renderPopover()}
      />
    );
  }
}