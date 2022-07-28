/**
 * @module FooterActions
 * @description 底部操作按钮
 */
import React from 'react';
import { Button } from 'antd';
import { MenuFoldOutlined, SaveFilled } from '@ant-design/icons';
import { AbstractActionItem, AbstractRow } from '../interface';
import { AbstractObjectProps } from '.';

interface FooterActionsProps<TRow> extends Pick<AbstractObjectProps<TRow>, 'cancelText' | 'okText' | 'isReadOnly'> {
  okLoading: boolean
  isReadOnly: boolean
  showCancel: boolean
  showOk: boolean
  handleCancel: () => void
  handleSubmit: () => void
  formValues: TRow
  okEnable?: (values: TRow) => boolean
  actions: AbstractActionItem<TRow>[]
}

interface FooterActionsState<TRow> {
  propsFormValues?: TRow
  formValues?: TRow
}

export default class FooterActions<TRow> extends React.Component<FooterActionsProps<TRow>, FooterActionsState<TRow>> {
  static getDerivedStateFromProps(props: FooterActionsProps<AbstractRow>, state: FooterActionsState<AbstractRow>) {
    if (props.formValues != state.propsFormValues) {
      return {
        formValues: props.formValues,
        propsFormValues: props.formValues,
      };
    }
    return null;
  }

  state: FooterActionsState<TRow> = {
  }

  refresh(values: TRow) {
    this.setState({ formValues: values });
  }

  render() {
    const { okLoading, isReadOnly, handleSubmit, handleCancel, showCancel, okEnable, showOk } = this.props;
    const { cancelText, okText, actions } = this.props;
    const { formValues } = this.state;
    const showOkBtn = !(isReadOnly || !showOk);
    const isOkEnable = () => okEnable ? okEnable(formValues || {} as TRow) : true;
    return (
      <div className="object-view-footer">
        <div>
          {
            showCancel && (
              <Button
                className="btn-back"
                size="large"
                onClick={handleCancel}
              >
                <MenuFoldOutlined />
                {cancelText || '返回'}
              </Button>
            )
          }
          {showOkBtn && (
            <Button
              loading={okLoading}
              className="btn-submit"
              type="primary"
              disabled={!isOkEnable()}
              onClick={handleSubmit}
              size="large"
            >
              <SaveFilled />
              {okText || '确定'}
            </Button>
          )}
          {
            actions?.map((render, i) => (
              <span className="footer-action-wrap" key={i}>{render(formValues || {} as TRow)}</span>
            ))
          }
        </div>
      </div>
    );
  }
}
