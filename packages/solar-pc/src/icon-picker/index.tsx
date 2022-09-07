import './index.scss';
import React from 'react';
import RemoteIconView from './RemoteIconView';
import { Button, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import IconInput from './IconInput';

export interface IconPickerProps {
  // 字体图标url
  url: string
  // 当前选择的图标
  value?: string
  /**
   * 选择模式
   * normal: 选择的value为icon的图标名
   * full: 选择的value为 图标名 +空格 +  字体名
   */
  mode?: 'normal' | 'full'
  // 当选择改变时触发
  onChange?: (icon: string) => void
  // 自定义渲染选中图标
  renderIcon?: (icon: string, family: string) => React.ReactElement
  // 是否允许清空
  allowClear?: boolean
  // 是否禁用
  disabled?: boolean
}

export interface IconPickerState {
  icon: string
  valueIcon: string
  visible: boolean
  fontFamily: string
}

export default class IconPicker extends React.Component<IconPickerProps, IconPickerState> {
  static defaultProps: IconPickerProps = {
    mode: 'normal',
    url: '',
  };

  static getDerivedStateFromProps(props: IconPickerProps, state: IconPickerState) {
    if (props.value !== state.valueIcon) {
      return {
        valueIcon: props.value,
        icon: props.value,
      };
    }
    return null;
  }

  static Input = IconInput;

  state: IconPickerState = {
    icon: '',
    valueIcon: '',
    visible: false,
    fontFamily: '',
  };

  onVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  clear = ()=>{
    this.props.onChange('');
    this.setState({ icon: '' });
  };

  onCheckedIcon = (icon: string) => {
    const value = this.props.mode == 'full' ? `${this.state.fontFamily} ${icon}` : icon;
    const { onChange } = this.props;
    onChange && onChange(value);
    this.setState({ visible: false, icon: icon });
  };

  renderCheckedIcon() {
    const { renderIcon } = this.props;
    const { fontFamily, icon } = this.state;
    if (renderIcon) {
      return renderIcon(icon, fontFamily);
    }
    const iconView = icon ? <div className={`${fontFamily} ${icon} icon-picker-icon`}></div> : <PlusOutlined />;
    return (
      <Button shape="circle" type="primary" icon={iconView} ></Button>
    );
  }

  renderIconViewer() {
    const { icon } = this.state;
    const { mode } = this.props;
    const value = mode == 'full' ? (icon || '').split(' ').pop() : icon;
    return (
      <RemoteIconView
        onLoad={(fontFamily) => this.setState({ fontFamily: fontFamily })}
        url={this.props.url}
        checkedIcon={value}
        onClick={this.onCheckedIcon}
      />
    );
  }

  renderPopover() {
    if (this.props.disabled) {
      return this.renderCheckedIcon();
    }
    const { allowClear } = this.props;
    const showClear =this.state.icon && allowClear;
    return (
      <React.Fragment>
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
        <sub>
          {
            !showClear ? null : (
              <Button
                type="link"
                onClick={() => this.clear()}
              >
              清空
              </Button>
            )
          }
        </sub>
      </React.Fragment>
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