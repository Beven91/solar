/**
 * @modle ObjectPicker
 * @description 对象选择
 */
import './index.scss';
import React, { useCallback, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import AbstractTable from '../abstract-table';
import { AbstractButton, AbstractTableProps } from '../abstract-table/types';
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
  width?: number
  // 弹窗高度
  height?: number
}

export interface AbstractTablePickerState {
  submiting: boolean
  selectedRows: AbstractRows
  visible: boolean
  prevValue?: any
}

const defaultFilters: AbstractFilters = {
  name: '@@mode',
  tabs: [
    { label: '全部', value: 'normal' },
    { label: '已选择', value: 'checked' },
  ],
};

export default function ObjectPicker<TRow = AbstractRow>(
  {
    width = 1080,
    rowKey = 'id',
    select = 'multiple',
    operation = { fixed: false },
    value = [],
    buttons,
    ...props
  }: React.PropsWithChildren<ObjectPickerProps<TRow>>
) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<TRow[]>(value);
  const { searchFields, height, pageSize, title, children, ...rest } = props;
  const filters = select == 'single' ? undefined : defaultFilters;

  // 当前操作按钮;
  const useButtons = useMemo(() => {
    return [
      ...(buttons || []),
      {
        target: 'cell',
        title: '选择',
        click: (row: TRow) => {
          const rows = selectedRows;
          const isSingle = select === 'single';
          if (isSingle) {
            rows.length = 0;
          }
          if (rows.indexOf(row) < 0) {
            rows.push(row);
          }
          setSelectedRows([...rows]);
          if (isSingle) {
            handleSubmit(rows);
          }
        },
      },
    ] as AbstractButton<TRow>[];
  }, [buttons, selectedRows]);


  const onTableQuery = useCallback((data: AbstractQueryType) => {
    const { onQuery } = props;
    if (!onQuery) return;
    if (props.filters) {
      return onQuery(data);
    }
    const query = data.query || data;
    if (query['@@mode'] == 'checked') {
      const rows = [...(selectedRows || [])];
      return Promise.resolve({
        count: rows.length,
        models: rows,
      });
    }
    return onQuery(data);
  }, [props.onQuery, props.filters, selectedRows]);

  // 确认选择
  const handleSubmit = useCallback((rows: TRow[]) => {
    const { onChange } = props;
    const promise = onChange && onChange((rows) as TRow[]);
    setLoading(true);
    Promise.resolve(promise).then(() => {
      setLoading(false);
      setVisible(false);
    });
  }, [props.onChange, selectedRows]);

  // 选中行发生改变
  const handleSelectRows = useCallback((selectedRows: TRow[]) => {
    setSelectedRows(selectedRows);
    if (select == 'single') {
      handleSubmit(selectedRows);
    }
  }, [select]);

  // 取消选择
  const handleCancel = useCallback(() => {
    setVisible(false);
    setSelectedRows(value || []);
  }, [value]);

  // 渲染按钮
  const renderButton = (children: React.ReactNode) => {
    if (children) {
      return <div>{children}</div>;
    }
    return <Button type="primary" icon={<PlusOutlined />}>{props.btnText || '请选择...'}</Button>;
  };

  const styles = useMemo(() => {
    return {
      content: { height },
    };
  }, [height]);

  return (
    <div>
      <div onClick={() => setVisible(true)}>
        {renderButton(children)}
      </div>
      <Modal
        wrapClassName="object-picker-modal"
        title={title || '请选择'}
        open={visible}
        okText="确定选择"
        cancelText="取消"
        width={width}
        styles={styles}
        onOk={() => handleSubmit(selectedRows)}
        onCancel={handleCancel}
        okButtonProps={{ loading: loading }}
      >
        <div className="object-picker-container">
          <AbstractTable
            filters={filters}
            {...rest}
            preserveSelectRowKeys={true}
            select={select}
            rowKey={rowKey}
            operation={operation}
            onQuery={onTableQuery}
            pageSize={pageSize}
            selectedRows={selectedRows}
            searchFields={searchFields}
            onSelectRows={handleSelectRows}
            buttons={useButtons}
          />
        </div>
      </Modal>
    </div>
  );
}