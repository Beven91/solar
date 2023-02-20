/**
 * @name AbstractTableInput
 * @description 表格输入控件
 */
import './index.scss';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import AbstractTable, { AbstractTableInstance } from '../abstract-table';
import { Button } from 'antd';
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import EditableCell from './EditableCell';
import { AbstractColumnType, AbstractEditColumnType, AbstractTableProps, AbstractButton } from '../abstract-table/types';
import { AbstractRules, AbstractRow, AbstractQueryType, AbstractResponseModel, AbstractAction } from '../interface';
import { FormInstance } from 'antd/lib/form';
import AbstractForm from 'solar-pc/src/abstract-form';
import TopActions from '../abstract-table/parts/TopActions';
import AbstractTableContext from '../abstract-table/context';

type UpdateReason = 'input' | 'row' | 'none'

const NOOP = [] as any[];

export interface AbstractTableInputProps<TRow extends AbstractRow> extends AbstractTableProps<TRow> {
  // 列配置信息
  columns: AbstractEditColumnType<TRow>[]
  // 返回的分页数据
  value?: TRow[]
  // 输入内容发生改变
  onChange?: (rows: TRow[]) => void
  // 保存指定行数据，仅在mode=row时能出发
  onSave?: (row: TRow) => Promise<any>
  /**
   * 编辑模式
   * all: 所有行同时可以编辑
   * row: 点击指定行的按钮进入编辑状态
   */
  mode?: 'all' | 'row',
  // 校验规则
  rules?: AbstractRules
  // 自定义创建行对象
  createRow?: (rowKey: string, columns: AbstractColumnType<TRow>[], index: number) => TRow
  // 新增按钮文案
  addButton?: React.ReactNode
  // 是否禁用
  disabled?: boolean
  // 是否可排序移动
  moveable?: boolean
  // 新增按钮是否可见
  addVisible?: (rows: TRow[]) => boolean
  // 删除按钮是否可见
  removeVisible?: (row: TRow) => boolean
  // 是否显示操作列
  hideOperation?: boolean
}

const components = {
  body: {
    cell: EditableCell,
  },
};

export default function AbstractTableInput<TRow extends AbstractRow>({
  rules = {},
  rowKey = 'id',
  pagination = false,
  mode = 'all',
  columns = [],
  createRow = (rowKey: string, columns: AbstractColumnType<AbstractRow>[], index: number) => {
    const emptyRow = {} as any;
    emptyRow[rowKey] = index;
    return emptyRow;
  },
  ...props
}: AbstractTableInputProps<TRow>) {
  const formRef = useRef<FormInstance>();
  const tableRef = useRef<AbstractTableInstance>();
  const [editRow, setEditRow] = useState<TRow>();
  const tableContext = useContext(AbstractTableContext);
  const [memo] = useState({
    updateReason: 'none' as UpdateReason,
    id: Date.now(),
    needFillRowForms: false,
    throttleId: null as any,
  });

  const rows = useMemo(() => props.value || [], [props.value]);
  const isLocal = !props.onQuery && pagination != false;
  const resetFields = () => formRef.current?.resetFields?.();

  // 当前表格列配置
  const mergedColumns = useMemo(() => {
    return columns.map(column => {
      const editable = !!column.editor && !props.disabled;
      return {
        ...column,
        editable: editable,
        onCell: !editable ? null : (record: TRow, index: number) => {
          const { pageNo, pageSize } = (tableRef.current || {}).pagination || {};
          const rowIndex = isLocal ? Math.max(pageNo - 1, 0) * pageSize + index : index;
          const editable = mode == 'all' ? true : record == editRow;
          return {
            record,
            // cellRef: getCellRef(index, column.name),
            rules: (rules || {})[column.name],
            form: formRef,
            item: {
              ...(column.formProps || {}),
              initialValue: column.initialValue,
              name: ['rows', rowIndex, column.name],
              render: () => column.editor(record, index),
              disabled: props.disabled,
            },
            title: column.title,
            editing: editable,
          };
        },
      } as AbstractColumnType<TRow>;
    });
  }, [rules, columns, editRow, mode, isLocal, props.disabled]);

  const onQuery = async(query: AbstractQueryType) => {
    const { onQuery } = props;
    if (onQuery) {
      const data = await Promise.resolve(onQuery(query) as Promise<AbstractResponseModel<TRow>>);
      formRef.current.setFieldsValue({ rows: data.models });
      return data;
    }
  };

  // 新增行
  const onCreateRow = () => {
    const row = createRow(rowKey as string, columns, ++memo.id);
    rows.push(row);
    triggerChange([...rows], 'row');
    tableRef.current.paginateIntoView(rows.length);
    if (mode == 'row' && !editRow) {
      setEditRow(row);
    }
  };

  // 删除行
  const onRemoveRow = (row: TRow) => {
    const index = rows.indexOf(row);
    rows.splice(index, 1);
    resetFields();
    triggerChange([...rows], 'row');
  };

  const onAction = (action: AbstractAction<TRow>) => {
    const onActionRoute = props.onActionRoute || tableContext.onAction;
    onActionRoute?.(action);
  };

  // 当值发生改变
  const onValuesChange = (changeValues: Record<any, any>) => {
    if (mode == 'row') return;
    clearTimeout(memo.throttleId);
    memo.throttleId = setTimeout(() => {
      // 修改指定项,时不进行onChange ,如果执行onChange可能会触发整个表格重新渲染,性能欠佳
      const changeRows = changeValues.rows;
      const originalRows = rows;
      let rowIndex = -1;
      Object.keys(changeRows).forEach((index: string) => {
        rowIndex = parseInt(index);
        const row = changeRows[index];
        const originRow = originalRows[rowIndex] as AbstractRow;
        Object.keys(row).forEach((key) => {
          originRow[key] = row[key];
        });
      });
      triggerChange([...originalRows], 'input');
    }, 200);
  };

  const triggerChange = (rows: TRow[], reason: UpdateReason) => {
    const { onChange } = props;
    memo.updateReason = reason;
    onChange && onChange(rows);
  };

  // 默认操作按钮
  const defaultButtons = useMemo(() => {
    if (mode == 'all') {
      return [
        {
          icon: <DeleteOutlined />,
          target: 'cell',
          tip: '删除',
          visible: props.removeVisible,
          confirm: '确定要删除当前行?',
          click: onRemoveRow,
        },
      ];
    }
    return [
      {
        target: 'cell',
        title: '编辑',
        visible: (row) => editRow != row,
        click: (row) => setEditRow(row),
      },
      {
        target: 'cell',
        title: '保存',
        visible: (row) => editRow == row,
        click: async(row: AbstractRow) => {
          const { onSave } = props;
          if (onSave) {
            const res = await formRef.current.validateFields();
            const rows = res.rows;
            const keys = Object.keys(rows);
            const editData = rows[keys[0]] || {};
            const data = {
              ...row,
              ...editData,
            };
            Promise.resolve(onSave(data)).then(() => {
              Object.keys(data).forEach((k) => {
                row[k] = data[k];
              });
              setEditRow(null);
            });
          }
        },
      },
      {
        target: 'cell',
        title: '取消',
        confirm: '您确定要取消编辑?',
        visible: (row) => editRow == row,
        click: () => {
          formRef.current?.resetFields();
          setEditRow(null);
        },
      },
    ] as AbstractButton<TRow>[];
  }, [mode, editRow, props.removeVisible, props.onSave]);

  // 移动按钮
  const moveButtons = useMemo(() => {
    if (props.disabled || !props.moveable) {
      return [];
    }
    return [
      {
        target: 'cell',
        tip: '上移',
        icon: <UpOutlined />,
        visible: (row, i) => i > 0,
        click: (row: TRow) => {
          const { onChange } = props;
          const index = rows.indexOf(row);
          const targetIndex = index - 1;
          if (targetIndex > -1) {
            rows[index] = rows[targetIndex];
            rows[targetIndex] = row;
          }
          onChange && onChange([...rows]);
        },
      },
      {
        target: 'cell',
        tip: '下移',
        visible: (row, i) => i < (rows.length - 1),
        icon: <DownOutlined />,
        click: (row: TRow) => {
          const index = rows.indexOf(row);
          const { onChange } = props;
          const targetIndex = index + 1;
          if (targetIndex < rows.length) {
            rows[index] = rows[targetIndex];
            rows[targetIndex] = row;
          }
          onChange && onChange([...rows]);
        },
      },
    ] as AbstractButton<TRow>[];
  }, [props.disabled, props.moveable, rows]);

  // 按钮
  const buttons = useMemo(() => {
    if (props.disabled || props.hideOperation) {
      return [];
    }
    return [
      ...defaultButtons,
      ...moveButtons,
      ...(props.buttons || []).filter((m) => m.target == 'cell'),
    ] as AbstractButton<TRow>[];
  }, [props.disabled, defaultButtons, moveButtons, props.hideOperation, props.buttons]);

  // 顶部按钮
  const topButtons = useMemo(() => {
    return (props.buttons || []).filter((m) => m.target != 'cell');
  }, [props.buttons]);

  useEffect(() => {
    if (memo.updateReason == 'input') {
      memo.updateReason = 'none';
      return;
    };
    formRef.current?.resetFields();
    formRef.current?.setFieldsValue({ rows: rows });
  }, [props.value]);

  // 渲染表格尾部
  const renderFooter = () => {
    const { footer } = props;
    const hideFooter = (!footer && rows?.length < 1);
    if (hideFooter) return null;
    return (
      <div className="abstract-table-input-footer">
        {footer ? <div className="abstract-table-input-footer-ext">{footer({} as any)}</div> : ''}
        <div className="footer-actions">
          {rows.length > 0 ? <div className="abstract-table-input-btns">{renderAddButton()}</div> : ''}
          <TopActions onAction={onAction} selectedRows={props.selectedRows} buttons={topButtons} />
        </div>
      </div>
    );
  };

  // 渲染新增行内容
  const renderAddButton = () => {
    const { addButton, addVisible, disabled } = props;
    if (disabled || addVisible && addVisible(rows) == false) {
      return '';
    }
    return (
      <div className="abstract-table-input-addrow">
        <div onClick={onCreateRow} className="abstract-table-input-addrow-btn">
          {addButton ?
            addButton :
            <Button type="dashed" icon={<PlusOutlined />} >追加一行</Button>}
        </div>
      </div>
    );
  };

  // 渲染
  return (
    <AbstractForm.ISolation
      value={{ rows: rows }}
      groups={NOOP}
      form={formRef}
      onValuesChange={onValuesChange}
    >
      <AbstractTable
        {...props}
        rowKey={rowKey}
        pagination={pagination}
        pageSize={pagination ? pagination.pageSize : undefined}
        autoHeight
        onQuery={onQuery}
        ref={tableRef}
        locale={{
          emptyText: renderAddButton(),
        }}
        components={components}
        data={{ models: rows, count: 0 }}
        buttons={buttons}
        footer={renderFooter}
        className={`abstract-table-input ${props.className || ''}`}
        columns={mergedColumns}
      >
        {props.children}
      </AbstractTable>
    </AbstractForm.ISolation>
  );
}