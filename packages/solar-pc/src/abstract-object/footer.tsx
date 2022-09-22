/**
 * @module FooterActions
 * @description 底部操作按钮
 */
import React from 'react';
import { Button, ButtonProps } from 'antd';
import { MenuFoldOutlined, SaveFilled } from '@ant-design/icons';
import { AbstractActionItem, AbstractActionItemContext, AbstractRow } from '../interface';

interface FooterActionsProps<TRow> {
  okLoading: boolean
  isReadOnly: boolean
  showCancel: boolean
  showOk: boolean
  btnSubmit?: ButtonProps
  btnCancel?: ButtonProps
  handleCancel: () => void
  handleSubmit: () => void
  validateForms: () => Promise<void>
  formValues: TRow
  record: TRow
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

  useValue(value: string, dv: string) {
    return value === null || value == undefined ? dv : value;
  }

  render() {
    const { okLoading, isReadOnly, handleSubmit, validateForms, handleCancel, showCancel, record, okEnable, showOk } = this.props;
    const { btnSubmit, btnCancel, actions } = this.props;
    const { formValues } = this.state;
    const showOkBtn = !(isReadOnly || !showOk);
    const ctx: AbstractActionItemContext = {
      bindValidate: (handler: Function) => {
        return async() => {
          await validateForms();
          handler && handler();
        };
      },
    };
    const model = {
      ...(formValues || {}),
      ...(record || {}),
    } as TRow;
    const isOkEnable = () => okEnable ? okEnable(model) : true;
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
            actions?.map((render, i) => {
              const node = render(model || {} as TRow, ctx);
              return (
                <span style={{ display: node ? 'inline' : 'none' }} className="footer-action-wrap" key={i}>{node}</span>
              );
            })
          }
        </div>
      </div>
    );
  }
}
