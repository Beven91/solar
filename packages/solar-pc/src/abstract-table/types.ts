import { ButtonProps } from 'antd/lib/button';
import { ColumnType } from 'antd/lib/table';
import React, { ReactElement } from 'react';
import { TableProps as RcTableProps } from 'rc-table/lib/Table';
import { AbstractQueryType, EnumsDataType, PlainObject, AbstractRow, AbstractResponseModel, AbstractAction, AbstractColumns, AbstractButtons, AbstractSFields, AbstractFilters, AbstractFormItemType } from '../interface';
import { GetPopupContainer, GetRowKey, SortOrder, TableLocale, TablePaginationConfig, TableRowSelection } from 'antd/lib/table/interface';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { SpinProps } from 'antd/lib/spin';
import { AbstractSearchProps } from '../abstract-search';

export type ForeignRequest = (row: PlainObject) => Promise<PlainObject>

export type ForeignKey = [string, ForeignRequest]

export type SelectMode = 'multiple' | 'single' | 'none'

export type RowKey = string | GetRowKey<AbstractRow>

// export type AbstractFormatters = 'date' | 'boolean' | 'money' | 'enums' | 'image' | 'fk'

export interface AbstractFormatters {
  date: any
  boolean: any
  money: any
  enums: any
  image: any
  fk: any
  privateImage: any
}

type AbstractFormatterConfig = [string, any];

export interface AbstractColumnType<TRow extends AbstractRow> extends Omit<ColumnType<TRow>, 'title'> {
  // 列属性名
  name: string
  // 列名
  title: string | React.ReactNode
  // 枚举格式化配置，配置后将根据当前列值，使用enums对象进行格式化
  enums?: EnumsDataType
  // 外键数据格式化，配置后，该列会渲染为 【查看】 点击查看后，根据配置的外键数据，进行查询
  // 配置规则:  fk:['username',queryUserById]   queryUserById().then((data)=> data['username'] )
  fk?: ForeignKey
  // 使用默认格式化工具 参见 formatter.js
  format?: keyof AbstractFormatters | AbstractFormatterConfig
  // 排序字段名
  sort?: string
}

export interface AbstractEditColumnType<TRow extends AbstractRow> extends AbstractColumnType<TRow> {
  initialValue?: any
  editor?: (row: TRow, index: number) => ReactElement
  formProps?: Omit<AbstractFormItemType<TRow>, 'name' | 'title' | 'render' | 'initialValue'>
}

interface AbstractBaseButton<TRow> extends Omit<ButtonProps, 'disabled' | 'role'> {
  // 按钮标题
  title: string,
  // 按钮动作名称，在没有指定click情况下，使用action点击后会触发表格的全局onAction事件
  action?: string
  // 是否需要出现确认提示 如果需要确定 可以设置如下: confirm:'您确定要删除?'
  confirm?: string,
  /**
   * 按钮角色控制，用于配合AbstractPermission组件使用
   * 如果用户没有指定的角色则按钮不出现。
   * 例如: admin,applyer
   */
  roles?: string
  // 控制改按钮是否可见
  visible?: (row: TRow, index: number) => boolean | boolean
  /**
   * 和enable不同之处在于，enblable返回false不显示按钮，disabled 返回true时会禁用按钮
   */
  disabled?: (row: TRow, index: number) => boolean | boolean
  // 自定义按钮渲染
  render?: (row?: TRow) => ReactElement;
  // 按钮提示文案
  tip?: string,
}

interface AbstractNormalButton<TRow> extends AbstractBaseButton<TRow> {
  // 按钮位置， 默认为 表格外，可设置: cell:显示在表格每行后面的操作按钮 top:显示在表格外面
  target?: 'cell' | 'top'
  select?: undefined
  // 按钮点击事件
  click?: (row: TRow, id?: any, e?: React.MouseEvent) => void
}

interface AbstractSingleButton<TRow> extends AbstractBaseButton<TRow> {
  // 按钮位置， 默认为 表格外，可设置: cell:显示在表格每行后面的操作按钮 top:显示在表格外面
  target?: 'top'
  select: 'single' | 'none',
  click?: (row: TRow, id?: any, e?: React.MouseEvent) => void
}

interface AbstractMultipleButton<TRow> extends AbstractBaseButton<TRow> {
  // 按钮位置， 默认为 表格外，可设置: cell:显示在表格每行后面的操作按钮 top:显示在表格外面
  target?: 'top'
  select: 'multiple',
  // 按钮点击事件
  click?: (rows: TRow[], id?: any, e?: React.MouseEvent) => void
}

export type AbstractButton<TRow> = AbstractNormalButton<TRow> | AbstractSingleButton<TRow> | AbstractMultipleButton<TRow>

export type OnActionRoute<TRow> = (action: AbstractAction<TRow>, button?: AbstractButton<TRow>) => void

export interface TableSearchOptions {
  // 搜索项默认值设定
  initialValues?: PlainObject
  // 查询按钮配置
  btnQuery?: ButtonProps
  // 取消按钮配置
  btnCancel?: ButtonProps
}

export interface AbstractTableProps<TRow extends AbstractRow> extends Omit<RcTableProps<TRow>, 'title' | 'dataSource' | 'transformColumns' | 'internalHooks' | 'internalRefs' | 'data' | 'columns' | 'scroll' | 'emptyText'> {
  // 表格列配置 可以参照Antd Table组件的column配置
  columns: AbstractColumns<TRow>
  // 操作按钮 具体内容查看 Types.button类型定义
  buttons?: AbstractButtons<TRow>
  // 搜索字段配置
  searchFields?: AbstractSFields
  // 触发点击按钮的action事件
  onActionRoute?: OnActionRoute<TRow>
  // 当触发分页，排序，以及搜索时触发
  onQuery?: (query: AbstractQueryType) => Promise<AbstractResponseModel<TRow>> | void
  // 返回的分页数据
  data?: AbstractResponseModel<TRow>,
  // 默认排序字段
  sort?: string,
  // 默认排序方式
  order?: string,
  // 表格tabs
  filters?: AbstractFilters,
  // 渲染表格topbar 可以往按钮签追加内容
  renderTopBar?: () => React.ReactNode
  // 选择数据时
  onSelectRows?: (selectedRows: TRow[]) => void
  // 是否强制开启选择模式
  select?: SelectMode
  // 默认选择的行数据
  selectedRows?: TRow[]
  // 操作列配置
  operation?: ColumnType<TRow>
  // 分页size
  pageSize?: number,
  // 所有列默认宽度
  cellWidth?: number,
  // 是否开启初始化，加载一次数据，默认为:true
  initQuery?: boolean
  // 是否高度自动
  autoHeight?: boolean
  // onQuery参数模式 scope ： 分页，排序等参数与查询参数分开， mix:则表示分页与查询参数混合再一起
  paramMode?: 'scope' | 'mix'
  // 查询容器配置
  searchOptions?: Partial<AbstractSearchProps<TRow>>
  // 搜索容器样式名
  searchBoxCls?: string
  // 搜搜容器按钮容器样式名
  searchBoxActionCls?: string
  // 操作按钮容器样式名
  buttonBoxCls?: string
  dropdownPrefixCls?: string;
  pagination?: false | TablePaginationConfig
  loading?: boolean | SpinProps
  size?: SizeType
  bordered?: boolean
  locale?: TableLocale
  rowSelection?: TableRowSelection<TRow>
  getPopupContainer?: GetPopupContainer
  scroll?: RcTableProps<TRow>['scroll'] & {
    scrollToFirstRowOnChange?: boolean;
  };
  sortDirections?: SortOrder[]
  showSorterTooltip?: boolean
}


export type {
  AbstractSFields,
  AbstractColumns,
};
