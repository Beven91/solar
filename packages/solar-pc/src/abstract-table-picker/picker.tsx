/**
 * @modle ObjectPicker
 * @description 对象选择
 */
import './index.scss';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import AbstractTable from '../abstract-table';
import { AbstractTableProps } from '../abstract-table/types';
import { AbstractFilters, AbstractQueryType, AbstractRow, AbstractRows } from '../interface';

export interface ObjectPickerProps<TRow> extends AbstractTableProps<TRow> {
  // 弹窗标题
  title: string
  // 当前选中的值
  value?: TRow[]
  // 选择数据后的改变事件
  onChange?: (selectedRows: TRow[]) => Promise<any> | void
  // 选择按钮文案
  btnText?: React.ReactNode
  // 弹窗宽度
  width: number
  // 弹窗高度
  height?: number
}

export interface AbstractTablePickerState {
  submiting: boolean
  selectedRows: AbstractRows
  visible: boolean
  prevValue?: any
}

export default class ObjectPicker<TRow = AbstractRow> extends React.Component<React.PropsWithChildren<ObjectPickerProps<TRow>>, AbstractTablePickerState> {
  // 默认属性值
  static defaultProps = {
    width: 1080,
    rowKey: 'id',
    select: 'multiple',
    operation: { fixed: false },
    value: [] as any,
  };

  tableRef = React.createRef<AbstractTable<TRow>>();

  // 状态改变配置
  static getDerivedStateFromProps(props: ObjectPickerProps<AbstractRow>, state: AbstractTablePickerState) {
    if (props.value !== state.prevValue) {
      return {
        prevValue: props.value,
        selectedRows: props.value || [],
      };
    }
    return null;
  }

  // 当前操作按钮
  // get buttons() {
  //   const { buttons } = this.props;
  //   return [
  //     ...(buttons || []),
  //     {
  //       target: 'cell',
  //       title: '选择',
  //       click: (row: AbstractRow) => {
  //         const rows = this.state.selectedRows;
  //         if (this.props.select === 'single') {
  //           rows.length = 0;
  //         }
  //         if (rows.indexOf(row) < 0) {
  //           rows.push(row);
  //         }
  //         this.setState({ selectedRows: [...rows] });
  //         this.handleSubmit();
  //       },
  //     },
  //   ] as AbstractButton<TRow>[];
  // }

  filters: AbstractFilters = {
    name: '@@mode',
    tabs: [
      { label: '全部', value: 'normal' },
      { label: '已选择', value: 'checked' },
    ],
  };

  state = {
    submiting: false,
    selectedRows: [] as AbstractRows,
    visible: false,
  };

  onQuery = (data: AbstractQueryType) => {
    const { onQuery } = this.props;
    if (!onQuery) return;
    if (this.props.filters) {
      return onQuery(data);
    }
    const query = data.query || data;
    if (query['@@mode'] == 'checked') {
      const rows = [...(this.state.selectedRows || [])];
      return Promise.resolve({
        count: rows.length,
        models: rows,
      });
    }
    return onQuery(data);
  };

  // 确认选择
  handleSubmit = () => {
    const { onChange } = this.props;
    const { selectedRows = [] } = this.state;
    const promise = onChange && onChange(selectedRows as TRow[]);
    this.setState({ submiting: true });
    Promise.resolve(promise).then(() => {
      this.setState({ visible: false, submiting: false });
    });
  };

  // 选中行发生改变
  handleSelectRows = (selectedRows: AbstractRows) => {
    this.setState({ selectedRows }, ()=>{
      if (this.props.select == 'single') {
        this.handleSubmit();
      }
    });
  };

  // 点击区域打开选择窗口
  handleOnClick = () => {
    this.setState({ visible: true });
  };

  // 取消选择
  handleCancel = () => {
    this.setState({ visible: false, selectedRows: this.props.value || [] });
  };

  // 渲染按钮
  renderButton = (children: React.ReactNode) => {
    if (children) {
      return <div>{children}</div>;
    }
    return <Button type="primary" icon={<PlusOutlined />}>{this.props.btnText || '请选择...'}</Button>;
  };

  // 渲染组件
  render() {
    const { width, searchFields, height, pageSize, title, children, ...props } = this.props;
    const { visible, selectedRows = [] } = this.state;
    const filters = props.select == 'single' ? undefined : this.filters;
    return (
      <div>
        <div onClick={this.handleOnClick}>
          {this.renderButton(children)}
        </div>
        <Modal
          wrapClassName="object-picker-modal"
          title={title || '请选择'}
          visible={visible}
          okText="确定选择"
          cancelText="取消"
          width={width}
          style={{ height: height }}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          okButtonProps={
            { loading: this.state.submiting }
          }
        >
          <div className="object-picker-container">
            <AbstractTable
              filters={filters}
              {...props}
              ref={this.tableRef}
              onQuery={this.onQuery}
              pageSize={pageSize}
              selectedRows={selectedRows}
              searchFields={searchFields}
              onSelectRows={this.handleSelectRows}
              // buttons={this.buttons}
            />
          </div>
        </Modal>
      </div>
    );
  }
}
