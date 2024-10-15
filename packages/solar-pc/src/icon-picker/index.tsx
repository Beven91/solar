import './index.scss';
import React, { useEffect, useState } from 'react';
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

export default function IconPicker({ url = '', mode = 'normal', ...props }: IconPickerProps) {
  const [icon, setIcon] = useState(props.value);
  const [fontFamily, setFontFamily] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setIcon(props.value);
  }, [props.value]);

  const onClear = ()=>{
    setIcon('');
    props.onChange('');
  };

  const onCheckedIcon = (icon: string) => {
    const value = mode == 'full' ? `${fontFamily} ${icon}` : icon;
    const { onChange } = props;
    onChange && onChange(value);
    setVisible(false);
    setIcon(icon);
  };

  const renderCheckedIcon = () => {
    const { renderIcon } = props;
    if (renderIcon) {
      return renderIcon(icon, fontFamily);
    }
    const iconView = icon ? <div className={`${fontFamily} ${icon} icon-picker-icon`}></div> : <PlusOutlined />;
    return (
      <Button shape="circle" type="primary" icon={iconView} ></Button>
    );
  };

  const renderIconViewer = () => {
    const value = mode == 'full' ? (icon || '').split(' ').pop() : icon;
    return (
      <RemoteIconView
        onLoad={setFontFamily}
        url={url}
        checkedIcon={value}
        onClick={onCheckedIcon}
      />
    );
  };

  const renderPopover = () => {
    if (props.disabled) {
      return renderCheckedIcon();
    }
    const { allowClear } = props;
    const showClear = icon && allowClear;
    return (
      <React.Fragment>
        <Popover
          trigger="click"
          title="图标库"
          placement="bottom"
          open={visible}
          onOpenChange={setVisible}
          content={renderIconViewer()}
        >
          {renderCheckedIcon()}
        </Popover>
        <sub>
          {
            !showClear ? null : (
              <Button
                type="link"
                onClick={onClear}
              >
                清空
              </Button>
            )
          }
        </sub>
      </React.Fragment>
    );
  };

  return (
    <div className="icon-picker">
      {renderPopover()}
      <div style={{ display: 'none' }}>
        {renderIconViewer()}
      </div>
    </div>
  );
}

IconPicker.Input = IconInput;