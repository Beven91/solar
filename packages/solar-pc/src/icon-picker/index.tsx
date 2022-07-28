import './index.scss';
import React from 'react';
import RemoteIconView from './RemoteIconView';
import { Button, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import IconInput from './IconInput';

export interface IconPickerProps {
  // 字体图标url
  url:string
  // 当前选择的图标
  value?:string
  // 当选择改变时触发
  onChange?:(icon:string)=>void
  // 自定义渲染选中图标
  renderIcon?:(icon:string, family:string) => React.ReactElement
  // 是否禁用
  disabled?:boolean
}

export interface IconPickerState {
  icon:string
  valueIcon:string
  visible:boolean
  fontFamily:string
}

export default class IconPicker extends React.Component<IconPickerProps, IconPickerState> {
  static getDerivedStateFromProps(props:IconPickerProps, state:IconPickerState) {
    if (props.value !== state.valueIcon) {
      return {
        valueIcon: props.value,
        icon: props.value,
      };
    }
    return null;
  }

  static Input = IconInput

  state:IconPickerState = {
    icon: '',
    valueIcon: '',
    visible: false,
    fontFamily: '',
  }

  onVisibleChange = (visible:boolean)=>{
    this.setState({ visible });
  }

  onCheckedIcon = (icon:string)=>{
    const { onChange } = this.props;
    onChange && onChange(icon);
    this.setState({ visible: false, icon: icon });
  }

  renderCheckedIcon() {
    const { renderIcon } = this.props;
    const { fontFamily, icon } = this.state;
    if (renderIcon) {
      return renderIcon(icon, fontFamily);
    }
    const iconView = icon ? <div className={`${fontFamily} ${icon} icon-picker-icon`}></div> : <PlusOutlined />;
    return <Button shape="circle" size="large" type="primary" icon={iconView} ></Button>;
  }

  renderIconViewer() {
    return (
      <RemoteIconView
        onLoad={(fontFamily)=>this.setState({ fontFamily: fontFamily })}
        url={this.props.url}
        checkedIcon={this.state.icon}
        onClick={this.onCheckedIcon}
      />
    );
  }

  renderPopover() {
    if (this.props.disabled) {
      return this.renderCheckedIcon();
    }
    return (
      <Popover
        trigger="click"
        title="图标库"
        placement="bottom"
        visible={this.state.visible}
        onVisibleChange={this.onVisibleChange}
        content={this.renderIconViewer()}
      >
        {this.renderCheckedIcon()}
      </Popover>
    );
  }

  render() {
    return (
      <div className="icon-picker">
        {this.renderPopover()}
        <div style={{ display: 'none' }}>
          {this.renderIconViewer()}
        </div>
      </div>
    );
  }
}