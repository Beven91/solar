/**
 * @name AbstractTableInput
 * @description 表格输入控件
 */
import './index.scss';
import React from 'react';
import AbstractTable from '../abstract-table';
import { Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import AbstractChildForm from '../abstract-object/ChildForm';
import EditableCell from './EditableCell';
import { AbstractColumnType, AbstractEditColumnType, AbstractTableProps, AbstractButton } from '../abstract-table/types';
import { AbstractRules, AbstractRow, AbstractQueryType, AbstractResponseModel } from '../interface';
import { FormInstance } from 'antd/lib/form';

 type UpdateReason = 'input' | 'row' | 'none'

export interface AbstractTableInputProps<TRow extends AbstractRow> extends AbstractTableProps<TRow> {
   // 列配置信息
   columns: AbstractEditColumnType<TRow>[]
   // 返回的分页数据
   value?: TRow[]
   // 输入内容发生改变
   onChange?: (rows: TRow[]) => void
   // 保存指定行数据，仅在mode=row时能出发
   onSave: (row: TRow) => Promise<any>
   /**
    * 编辑模式
    * all: 所有行同时可以编辑
    * row: 点击指定行的按钮进入编辑状态
    */
   mode: 'all' | 'row',
   // 校验规则
   rules?: AbstractRules
   // 自定义创建行对象
   createRow?: (rowKey: string, columns: AbstractColumnType<TRow>[], index: number) => TRow
   // 新增按钮文案
   addButton?: React.ReactNode
   // 是否禁用
   disabled?: boolean
   // 新增按钮是否可见
   addVisible: (rows: TRow[]) => boolean
   // 删除按钮是否可见
   removeVisible: (row: TRow) => boolean
   // 是否显示操作列
   hideOperation?: boolean
 }

 interface AbstractTableInputState<TRow> {
   editRow: TRow
 }

const components = {
  body: {
    cell: EditableCell,
  },
};

export default class AbstractTableInput<TRow extends AbstractRow> extends React.Component<AbstractTableInputProps<TRow>, AbstractTableInputState<TRow>> {
  // 默认属性值
  static defaultProps: Partial<AbstractTableInputProps<any>> = {
    rules: {},
    rowKey: 'id',
    pagination: false,
    mode: 'all',
    createRow: (rowKey: string, columns: AbstractColumnType<AbstractRow>[], index: number) => {
      const emptyRow = {} as any;
      emptyRow[rowKey] = index;
      return emptyRow;
    },
  };

  constructor(props: AbstractTableInputProps<TRow>) {
    super(props);
    this.id = Date.now();
    // 新增数据缓存的key
    this.cacheRowsRefs = {};
    this.tableRef = React.createRef();
    this.state = {
      editRow: null,
    };
  }

  // 产生更新的原因
  updateReason: UpdateReason = 'none';

  // 产生更新的数据
  triggerRows: TRow[];

  // 是否需要填充行表单
  needFillRowForms = false;

  id = 0;

  tableRef = React.createRef<AbstractTable<TRow>>();

  throttleId: any;

  cacheRowsRefs = {} as {
     [propName: string]: {
       [propName: string]: React.RefObject<React.Component>
     }
   };

  formRef = React.createRef<FormInstance>();

  get locale() {
    return {
      emptyText: this.renderAddButton(),
    };
  }

  get rows() {
    return (this.props.value || []);
  }

  get isLocal() {
    return !this.props.onQuery;
  }

  // 当前表格列配置
  get mergedColumns() {
    const rules = this.props.rules;
    const columns = this.props.columns || [];
    return columns.map(column => {
      const editable = !!column.editor && !this.props.disabled;
      return {
        ...column,
        editable: editable,
        onCell: !editable ? null : (record: TRow, index: number) => {
          const { pageNum, pageSize } = (this.tableRef.current || {}).state || {};
          const rowIndex = this.isLocal ? Math.max(pageNum - 1, 0) * pageSize + index : index;
          const editable = this.props.mode == 'all' ? true : record == this.state.editRow;
          return {
            record,
            cellRef: this.getCellRef(index, column.name),
            rules: rules[column.name],
            form: this.formRef,
            item: {
              ...(column.formProps || {}),
              initialValue: column.initialValue,
              name: ['rows', rowIndex, column.name],
              render: () => column.editor(record, index),
              disabled: this.props.disabled,
            },
            title: column.title,
            editing: editable,
          };
        },
      } as AbstractColumnType<TRow>;
    });
  }

  onQuery = async(query: AbstractQueryType) => {
    const { onQuery } = this.props;
    if (onQuery) {
      const data = await Promise.resolve(onQuery(query) as Promise<AbstractResponseModel<TRow>>);
      // this.originRows = data.models || [];
      this.formRef.current.setFieldsValue({ rows: data.models });
      return data;
    }
  };

  getCellRef(rowIndex: number, cell: string, creatable = true) {
    // const pageNum = Math.max(this.tableRef.current.state.pageNum, 1);
    // const rowIndex = pageNum * index;
    if (!this.cacheRowsRefs[rowIndex]) {
      this.cacheRowsRefs[rowIndex] = {};
    }
    const row = this.cacheRowsRefs[rowIndex];
    if (!row[cell] && creatable) {
      row[cell] = React.createRef<React.Component>();
    }
    return row[cell];
  }

  // 新增行
  handleAddRow = () => {
    const { createRow, columns, rowKey } = this.props;
    const rows = this.rows;
    const row = createRow(rowKey as string, columns, ++this.id);
    rows.push(row);
    this.triggerChange([...rows], 'row');
    this.tableRef.current.paginateIntoView(rows.length);
    if (this.props.mode == 'row' && !this.state.editRow) {
      this.setState({ editRow: row });
    }
  };

  // 删除行
  handleRemoveRow = (row: TRow) => {
    const rows = this.rows;
    const index = rows.indexOf(row);
    rows.splice(index, 1);
    this.resetFields();
    this.triggerChange([...rows], 'row');
  };

  // 当值发生改变
  onValuesChange = (changeValues: Record<any, any>) => {
    clearTimeout(this.throttleId);
    this.throttleId = setTimeout(() => {
      // 修改指定项,时不进行onChange ,如果执行onChange可能会触发整个表格重新渲染,性能欠佳
      if (this.props.mode == 'row') return;
      const changeRows = changeValues.rows;
      const originalRows = this.rows;
      let rowIndex = -1;
      Object.keys(changeRows).forEach((index: string) => {
        rowIndex = parseInt(index);
        const row = changeRows[index];
        const originRow = originalRows[rowIndex] as AbstractRow;
        Object.keys(row).forEach((key) => {
          originRow[key] = row[key];
        });
      });
      const columns = this.props.columns || [];
      columns.forEach((column) => {
        const name = column.name;
        const ref = this.getCellRef(rowIndex, name);
        if (ref && ref.current) {
          ref.current.forceUpdate();
        }
      });
      this.triggerChange([...originalRows], 'input');
    }, 200);
  };

  triggerChange(rows: TRow[], reason: UpdateReason) {
    const { onChange } = this.props;
    this.updateReason = reason;
    this.triggerRows = rows;
    onChange && onChange(rows);
  }

  // 默认操作按钮
  get defaultButtons() {
    if (this.props.mode == 'all') {
      return [
        {
          icon: <DeleteOutlined />,
          target: 'cell',
          tip: '删除',
          visible: this.props.removeVisible,
          confirm: '确定要删除当前行?',
          click: this.handleRemoveRow,
        },
      ];
    }
    return [
      {
        target: 'cell',
        title: '编辑',
        visible: (row) => this.state.editRow != row,
        click: (row) => this.setState({ editRow: row }),
      },
      {
        target: 'cell',
        title: '保存',
        visible: (row) => this.state.editRow == row,
        click: async(row: AbstractRow) => {
          const { onSave } = this.props;
          if (onSave) {
            const res = await this.formRef.current.validateFields();
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
              this.setState({ editRow: null });
            });
          }
        },
      },
      {
        target: 'cell',
        title: '取消',
        confirm: '您确定要取消编辑?',
        visible: (row) => this.state.editRow == row,
        click: () => this.setState({ editRow: null }),
      },
    ] as AbstractButton<TRow>[];
  }

  // 按钮
  get buttons() {
    if (this.props.disabled || this.props.hideOperation) {
      return [];
    }
    return [
      ...this.defaultButtons,
      ...(this.props.buttons || []), ,
    ] as AbstractButton<TRow>[];
  }

  resetFields() {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  }

  // 渲染表格尾部
  renderFooter() {
    const { footer } = this.props;
    return (
      <div className="abstract-table-input-footer">
        {footer ? <div className="abstract-table-input-footer-ext">{footer({} as any)}</div> : ''}
        {this.rows.length > 0 ? <div className="abstract-table-input-btns">{this.renderAddButton()}</div> : ''}
      </div>
    );
  }

  // 渲染新增行内容
  renderAddButton() {
    const { addButton, addVisible, disabled } = this.props;
    if (disabled || addVisible && addVisible(this.rows) == false) {
      return '';
    }
    return (
      <div className="abstract-table-input-addrow">
        <div onClick={this.handleAddRow} className="abstract-table-input-addrow-btn">
          {addButton ?
            addButton :
            <Button type="dashed" icon={<PlusOutlined />} >追加一行</Button>}
        </div>
      </div>
    );
  }

  getRenderFooter() {
    const { footer } = this.props;
    return (footer || this.rows.length > 0) ? () => this.renderFooter() : null;
  }

  shouldComponentUpdate(nextProps: AbstractTableInputProps<TRow>) {
    if (this.triggerRows === nextProps.value && this.updateReason == 'input') {
      this.needFillRowForms = false;
      this.updateReason = 'none';
      return false;
    }
    if (nextProps.value !== this.props.value && this.updateReason === 'none') {
      this.needFillRowForms = true;
    }
    return true;
  }

  componentDidUpdate() {
    this.updateReason = 'none';
    if (this.needFillRowForms && this.formRef.current) {
      this.needFillRowForms = false;
      this.formRef.current.setFieldsValue({ rows: this.rows });
      this.forceUpdate();
    }
  }

  // 渲染
  render() {
    const rows = this.rows;
    return (
      <React.Fragment>
        <AbstractChildForm
          component={false}
          initialValues={{ rows: rows }}
          onValuesChange={this.onValuesChange}
          formRef={this.formRef}
        >
          <AbstractTable
            {...this.props}
            autoHeight
            onQuery={this.onQuery}
            ref={this.tableRef}
            locale={this.locale}
            components={components}
            data={{ models: this.rows, count: 0 }}
            buttons={this.buttons}
            footer={this.getRenderFooter()}
            className={`abstract-table-input ${this.props.className || ''}`}
            columns={this.mergedColumns}
          >
            {this.props.children}
          </AbstractTable>
        </AbstractChildForm>
      </React.Fragment>
    );
  }
}
