/**
 * @name FormGroup
 * @description 表单分组行
 */
import './index.scss';
import React, { ReactNode } from 'react';
import { Card, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { AbstractFormGroupItemType, AbstractRow, FormGroupStyle } from '../interface';
import VirtualInput from './VirtualInput';

const isVisible = (item: AbstractFormGroupItemType<any>, data: AbstractRow) => {
  if (typeof item.visible === 'function') {
    return item.visible(data);
  } else if (item.visible !== undefined) {
    return item.visible;
  }
  return true;
};

export interface FormGroupProps<TRow> {
  // 组名称
  title: ReactNode
  // 图标
  icon?: ReactNode,
  // 展示模式
  mode: FormGroupStyle
  // 样式名
  className?: string
  // 配置
  group: AbstractFormGroupItemType<TRow>
  // 数据
  model: TRow
  // form对象
  form: React.RefObject<FormInstance>
  noLeftPadding?: boolean
}

export interface FormGroupState {
  visible: boolean
  visibleFunction: Function
}

export default class FormGroup<TRow extends AbstractRow> extends React.Component<React.PropsWithChildren<FormGroupProps<TRow>>, FormGroupState> {
  static defaultProps: FormGroupProps<AbstractRow> = {
    title: '',
    className: '',
    mode: 'normal',
    form: null as any,
    group: null as any,
    model: {} as any,
  };

  static getDerivedStateFromProps(nextProps: FormGroupProps<AbstractRow>, state: FormGroupState) {
    const { group } = nextProps;
    if (group.visible != state.visibleFunction) {
      return {
        visibleFunction: group.visible,
        visible: isVisible(group, nextProps.model || {}),
      };
    }
    return null;
  }

  state = {
    visible: true,
    visibleFunction: null as any,
  };

  shouldUpdate = (prevValues: any, curValues: any) => {
    const group = this.props.group;
    const visible = isVisible(group, curValues);
    const changed = this.state.visible !== visible;
    const form = this.props.form.current;
    if (!form) {
      return false;
    }
    if (changed) {
      this.setState({ visible });
    }
    return false;
  };

  // 渲染
  renderGroup() {
    const { className, icon, mode } = this.props;
    const { visible } = this.state;
    if (!visible) {
      // 如果不可见
      return null;
    }

    const title = (
      <div className="from-group-title">
        {icon}
        {this.props.title}
      </div>
    );

    const style = this.props.noLeftPadding ? { paddingLeft: 0 } : undefined;

    return (
      <Card
        headStyle={style}
        bodyStyle={style}
        className={`form-group ${className} ${mode || ''}`}
        title={this.props.title ? title : ''}
      >
        {this.props.children}
      </Card>
    );
  }

  render = () => {
    return (
      <Form.Item
        name="member"
        className="form-group-level form-group-box"
        style={{ marginBottom: 0 }}
        shouldUpdate={this.shouldUpdate}
      >
        <VirtualInput>
          {this.renderGroup()}
        </VirtualInput>
      </Form.Item>
    );
  };
}
