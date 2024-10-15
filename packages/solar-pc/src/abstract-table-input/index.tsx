/* eslint-disable space-before-function-paren */
/**
 * @name AbstractTableInput
 * @description 表格输入控件
 */
import './index.scss';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import AbstractTable, { AbstractTableInstance } from '../abstract-table';
import { Button, FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import EditableCell, { EditableCellProps } from './EditableCell';
import { AbstractColumnType, AbstractEditColumnType, AbstractTableProps, AbstractButton } from '../abstract-table/types';
import { AbstractRules, AbstractRow, AbstractQueryType, AbstractResponseModel, AbstractAction, AbstractFormItemType } from '../interface';
import TopActions from '../abstract-table/parts/TopActions';
import AbstractTableContext from '../abstract-table/context';
import EditableRow, { formRefSymbol } from './EditableRow';

type UpdateReason = 'input' | 'item' | 'none'

const tempId = Symbol('tempId');

export interface AbstractTableInputProps<TRow extends AbstractRow> extends Omit<AbstractTableProps<TRow>, 'rowKey'> {
  // 列配置信息
  columns: AbstractEditColumnType<TRow>[]
  // 返回的分页数据
  value?: TRow[]
  // 输入内容发生改变
  onChange?: (rows: TRow[]) => void
  // 保存指定行数据，仅在mode=row时触发
  onSave?: (row: TRow) => Promise<any>
  // 自定义移除事件
  onRemove?: (row: TRow) => Promise<any>
  // 自定义编辑事件
  onEdit?: (row: TRow, defaultEdit: (row: TRow) => void) => Promise<TRow>
  // 自定义创建事件
  onCreate?: (emptyRow: TRow) => TRow | Promise<TRow>
  /**
   * 编辑模式
   * all: 所有行同时可以编辑
   * row: 单行编辑
   */
  mode?: 'all' | 'row',
  // 校验规则
  rules?: AbstractRules
  // 自定义创建行对象
  createRow?: (columns: AbstractColumnType<TRow>[]) => TRow
  // 新增按钮文案
  addButton?: React.ReactNode
  // 是否禁用
  disabled?: boolean
  // 是否可排序移动
  moveable?: boolean
  // 新增按钮是否可见
  addVisible?: (rows: TRow[]) => boolean
  // 删除按钮是否可见
  removeVisible?: (row: TRow, idx: number) => boolean
  // 是否显示操作列
  hideOperation?: boolean
  // 删除二次确认文案
  removeConfirm?: React.ReactNode
  // 取消编辑二次确认文案
  cancelConfirm?: React.ReactNode
  // 新增或者编辑后是否刷新页面
  savedReload?: boolean
  // 主键
  rowKey?: string
}

const components = {
  body: {
    cell: EditableCell,
    row: EditableRow,
  },
};

const ensureArray = (v: any) => {
  return v instanceof Array ? v.filter(Boolean) : [v].filter(Boolean);
};

export default function AbstractTableInput<TRow extends AbstractRow = AbstractRow>({
  rules = {},
  pagination = false,
  mode = 'all',
  columns = [],
  rowKey = '',
  savedReload = false,
  removeConfirm = '确定要删除当前行?',
  cancelConfirm = '您确定要取消编辑?',
  createRow = () => {
    const emptyRow = {} as any;
    return emptyRow;
  },
  ...props
}: AbstractTableInputProps<TRow>) {
  const tableRef = useRef<AbstractTableInstance>();
  const [editRow, setEditRow] = useState<TRow>();
  const tableContext = useContext(AbstractTableContext);
  const vrows = useMemo(() => ensureArray(props.value), [props.value]);
  const getRowKey = useCallback((row: any) => row[rowKey] || row[tempId], [rowKey]);
  const memoRef = useRef({
    updateReason: 'none' as UpdateReason,
    count: 0,
    timerId: null,
    currentEditIndex: -1,
    changingRowIndex: -1,
    isCreateRow: false,
    originEditRow: null,
    needFillRowForms: false,
    rows: vrows || [],
  });

  memoRef.current.rows = vrows;
  const isLocal = !props.onQuery && pagination != false;

  if (isLocal) {
    memoRef.current.count = vrows?.length || 0;
  }

  const updateChagingIndex = (idx: number) => {
    memoRef.current.changingRowIndex = idx;
  };

  const handleReload = (() => {
    if (typeof props.onQuery === 'function' && savedReload) {
      tableRef.current?.reload?.();
    };
  });

  const operation = useMemo(() => {
    return {
      ...props.operation as AbstractColumnType<TRow>,
      onCell: (record: TRow, index: number) => {
        return {
          editor: {
            index: index,
            chaningIndex: memoRef.current.changingRowIndex,
          },
        } as EditableCellProps;
      },
    } as AbstractColumnType<TRow>;
  }, [props.operation]);

  // 当前表格列配置
  const mergedColumns = useMemo(() => {
    return columns.map(({ editor, ...column }) => {
      const editable = !!editor && !props.disabled;
      const isFn = typeof editor == 'function';
      const render = isFn ? editor : undefined;
      const formProps = isFn ? { render } : editor || {};
      const item = {
        ...formProps,
        title: '',
        initialValue: column.initialValue,
        name: column.name,
        disabled: props.disabled,
      } as AbstractFormItemType<TRow>;
      const editRules = (rules || {})[column.name];
      return {
        ...column,
        editable: editable,
        onCell: (record: TRow, index: number) => {
          const editing = mode == 'all' ? true : record == editRow;
          return {
            title: column.title,
            editor: {
              record,
              rules: editRules,
              item: item,
              index,
              chaningIndex: memoRef.current.changingRowIndex,
              editing: editable && editing,
            },
          } as EditableCellProps;
        },
      } as AbstractColumnType<TRow>;
    });
  }, [rules, columns, editRow, mode, isLocal, props.disabled]);

  const onQuery = async (query: AbstractQueryType) => {
    const { onQuery } = props;
    if (onQuery) {
      const data = await Promise.resolve(onQuery(query) as Promise<AbstractResponseModel<TRow>>);
      memoRef.current.count = data.count;
      memoRef.current.rows = data.models;
      props.onChange?.(data.models);
      return data;
    }
  };

  // 新增行
  const onCreateRow = async () => {
    const memo = memoRef.current;
    const rows = memo.rows;
    let row = createRow(columns);
    let customRow = null;
    if (props.onCreate) {
      customRow = await props.onCreate(row);
    }
    if (customRow) {
      row = customRow;
    }
    rows.push(row);
    triggerChange([...rows], 'item');
    tableRef.current.paginateIntoView(rows.length, savedReload && !!customRow);
    memoRef.current.isCreateRow = true;
    updateChagingIndex(rows.length - 1);
    if (mode == 'row' && !editRow && !customRow) {
      setEditRow(row);
    }
  };

  // 删除行
  const onRemoveRow = (row: TRow) => {
    return Promise
      .resolve(props.onRemove?.(row))
      .then(() => {
        const memo = memoRef.current;
        const rows = memo.rows;
        const index = rows.indexOf(row);
        rows.splice(index, 1);
        triggerChange([...rows], 'item');
        handleReload();
      });
  };

  const onAction = (action: AbstractAction<TRow>) => {
    const onActionRoute = props.onActionRoute || tableContext.onAction;
    onActionRoute?.(action);
  };

  const syncUpdates = useCallback((originalRows: TRow[], changeValue: object, originRow: TRow) => {
    const id = (originRow as any)[tempId];
    const o = originalRows.find((m: object) => m[tempId] == id);
    if (o) {
      const index = originalRows.indexOf(o);
      (originalRows as any)[index] = changeValue;
      return index;
    }
  }, []);

  const triggerChange = useCallback((rows: TRow[], reason: UpdateReason) => {
    const memo = memoRef.current;
    const { onChange } = props;
    memo.updateReason = reason;
    onChange && onChange(rows);
  }, [props.onChange]);

  // 当值发生改变
  const onValuesChange = useCallback((changeValues: Record<any, any>, originRow: TRow) => {
    const memo = memoRef.current;
    const rows = memo.rows;
    if (mode == 'row') {
      syncUpdates(rows, changeValues, originRow);
      return;
    }
    const idx = syncUpdates(rows, changeValues, originRow);
    memoRef.current.currentEditIndex = idx;
    memoRef.current.originEditRow = originRow;
    updateChagingIndex(idx);
    triggerChange([...rows], 'input');
  }, [syncUpdates, triggerChange]);

  const handleEdit = async (row: TRow) => {
    if (!props.onEdit) {
      setEditRow(row);
      return;
    }
    const updatedRow = await props.onEdit(row, setEditRow);
    if (updatedRow) {
      Object.keys(updatedRow).forEach((k) => {
        (row as object)[k] = updatedRow[k];
      });
      const rows = memoRef.current.rows;
      syncUpdates(rows, row, row);
      triggerChange([...memoRef.current.rows], 'input');
    }
  };

  // 默认操作按钮
  const defaultButtons = useMemo(() => {
    if (mode == 'all') {
      return [
        {
          icon: <DeleteOutlined />,
          target: 'cell',
          tip: '删除',
          size: 'small',
          visible: props.removeVisible,
          confirm: removeConfirm,
          click: onRemoveRow,
        },
      ];
    }
    return [
      {
        target: 'cell',
        title: '编辑',
        visible: (row) => editRow != row,
        click: (r) => {
          memoRef.current.isCreateRow = false;
          memoRef.current.originEditRow = JSON.parse(JSON.stringify(r));
          handleEdit(r);
        },
      },
      {
        target: 'cell',
        title: '保存',
        visible: (row) => editRow == row,
        click: async (row: AbstractRow) => {
          const { onSave } = props;
          const formRef = (row as any)[formRefSymbol] as React.RefObject<FormInstance>;
          const values = await formRef.current.validateFields();
          const editData = values;
          const rows = memoRef.current.rows;
          const data = {
            ...row,
            ...editData,
          };
          const response = onSave ? onSave(data) : data;
          return Promise.resolve(response).then(() => {
            Object.keys(data).forEach((k) => {
              row[k] = data[k];
            });
            handleReload();
            triggerChange([...rows], 'item');
            setEditRow(null);
          });
        },
      },
      {
        target: 'cell',
        title: '取消',
        confirm: cancelConfirm,
        visible: (row) => editRow == row,
        click: (r) => {
          const rows = memoRef.current.rows;
          if (memoRef.current.isCreateRow) {
            memoRef.current.isCreateRow = false;
            // 如果新增的空行
            const originRows = rows.filter((m) => m !== r);
            triggerChange(originRows, 'item');
            setEditRow(null);
            return;
          }
          const formRef = (r as any)[formRefSymbol] as React.RefObject<FormInstance>;
          const originRow = memoRef.current.originEditRow || {};
          syncUpdates(rows, originRow, r);
          triggerChange([...rows], 'item');
          formRef.current.resetFields();
          setEditRow(null);
        },
      },
      {
        target: 'cell',
        title: '删除',
        visible: props.removeVisible,
        confirm: removeConfirm,
        click: onRemoveRow,
      },
    ] as AbstractButton<TRow>[];
  }, [mode, editRow, removeConfirm, cancelConfirm, props.removeVisible, props.onSave]);

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
        size: 'small',
        visible: (row, i) => {
          const rows = memoRef.current.rows;
          const idx = rows.indexOf(row);
          return idx > 0;
        },
        click: (row: TRow) => {
          const memo = memoRef.current;
          const rows = memo.rows;
          const { onChange } = props;
          const index = rows.indexOf(row);
          const targetIndex = index - 1;
          if (targetIndex > -1) {
            rows[index] = rows[targetIndex];
            rows[targetIndex] = row;
          }
          onChange && onChange([...rows]);
          tableRef.current.paginateIntoView(targetIndex + 1);
        },
      },
      {
        target: 'cell',
        tip: '下移',
        size: 'small',
        visible: (row) => {
          const rows = memoRef.current.rows;
          const idx = rows.indexOf(row);
          return idx < (rows.length - 1);
        },
        icon: <DownOutlined />,
        click: (row: TRow) => {
          const memo = memoRef.current;
          const rows = memo.rows;
          const index = rows.indexOf(row);
          const { onChange } = props;
          const targetIndex = index + 1;
          if (targetIndex < rows.length) {
            rows[index] = rows[targetIndex];
            rows[targetIndex] = row;
          }
          onChange && onChange([...rows]);
          tableRef.current.paginateIntoView(targetIndex + 1);
        },
      },
    ] as AbstractButton<TRow>[];
  }, [props.disabled, props.moveable]);

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

  // 渲染表格尾部
  const renderFooter = () => {
    const memo = memoRef.current;
    const rows = memo.rows;
    const { footer } = props;
    const hideFooter = (!footer && rows?.length < 1);
    if (hideFooter) return null;
    const btn = renderAddButton();
    const hideActions = !btn && topButtons?.length < 1;
    return (
      <div className="abstract-table-input-footer">
        {footer ? <div className="abstract-table-input-footer-ext">{footer({} as any)}</div> : ''}
        <div className="footer-actions" style={{ display: hideActions ? 'none' : undefined }}>
          {rows?.length > 0 ? <div className="abstract-table-input-btns">{btn}</div> : ''}
          <TopActions onAction={onAction} selectedRows={props.selectedRows} buttons={topButtons} />
        </div>
      </div>
    );
  };

  // 渲染新增行内容
  const renderAddButton = () => {
    const memo = memoRef.current;
    const rows = memo.rows;
    const { addButton, addVisible, disabled } = props;
    if (disabled || addVisible && addVisible(rows) == false) {
      return '';
    }
    if (addButton && editRow) {
      return null;
    }
    return (
      <div className="abstract-table-input-addrow">
        <div onClick={onCreateRow} className="abstract-table-input-addrow-btn">
          {addButton || <Button disabled={!!editRow} type="dashed" icon={<PlusOutlined />} >追加一行</Button>}
        </div>
      </div>
    );
  };

  const onRow = useCallback((record: TRow, index) => {
    return {
      onChange: onValuesChange,
      record: record,
      disabled: props.disabled || (record != editRow && mode !== 'all'),
      index,
    } as any;
  }, [props.disabled, mode, editRow]);

  const models = useMemo(() => {
    const editIndex = memoRef.current.currentEditIndex;
    const editRow = memoRef.current.originEditRow;
    return (memoRef.current.rows || []).map((m, index) => {
      if (!m[tempId]) {
        // 这里如果存在正在编辑的行，则需要将编辑行的id保持原始值，方式输入框失去焦点
        const id = editRow && index == editIndex ? editRow[tempId] : Date.now().toString() + '_' + index;
        m[tempId] = id;
      }
      return m;
    });
  }, [memoRef.current.rows]);

  // 渲染
  return (
    <AbstractTable
      {...props}
      rowKey={getRowKey}
      pagination={pagination}
      pageSize={pagination ? pagination.pageSize : undefined}
      autoHeight
      onQuery={onQuery}
      ref={tableRef}
      locale={{
        emptyText: renderAddButton(),
      }}
      operation={operation}
      components={components}
      data={{ models: models, count: memoRef.current.count }}
      buttons={buttons}
      footer={renderFooter}
      className={`abstract-table-input ${props.className || ''}`}
      columns={mergedColumns}
      onRow={onRow}
    >
      {props.children}
    </AbstractTable>
  );
}