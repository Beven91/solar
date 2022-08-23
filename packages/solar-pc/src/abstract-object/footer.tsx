/**
 * @module FooterActions
 * @description 底部操作按钮
 */
import React from 'react';
import { Button, ButtonProps } from 'antd';
import { MenuFoldOutlined, SaveFilled } from '@ant-design/icons';
import { AbstractActionItem, AbstractRow } from '../interface';

 interface FooterActionsProps<TRow> {
   okLoading: boolean
   isReadOnly: boolean
   showCancel: boolean
   showOk: boolean
   btnSubmit?: ButtonProps
   btnCancel?: ButtonProps
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
  };

  refresh(values: TRow) {
    this.setState({ formValues: values });
  }

  useValue(value:string, dv:string) {
    return value === null || value == undefined ? dv : value;
  }

  render() {
    const { okLoading, isReadOnly, handleSubmit, handleCancel, showCancel, okEnable, showOk } = this.props;
    const { btnSubmit, btnCancel, actions } = this.props;
    const { formValues } = this.state;
    const showOkBtn = !(isReadOnly || !showOk);
    const isOkEnable = () => okEnable ? okEnable(formValues || {} as TRow) : true;
    return (
      <div className="object-view-footer">
        <div style={{ display: 'inline-block' }}>
          {
            showCancel && (
              <Button
                className="btn-back"
                size="large"
                onClick={handleCancel}
                icon={btnCancel?.icon || <MenuFoldOutlined />}
                {...(btnCancel || {})}
              >
                {this.useValue(btnCancel?.title, '返回')}
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
              icon={btnSubmit?.icon || <SaveFilled />}
              {...(btnSubmit || {})}
            >
              {this.useValue(btnSubmit?.title, '确定')}
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
