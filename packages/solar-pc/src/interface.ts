import { ColProps } from 'antd/lib/col';
import { FormInstance, Rule } from 'antd/lib/form';
import { NamePath, ScrollOptions } from 'antd/lib/form/interface';
import React, { ReactElement, ReactNode } from 'react';
import { AbstractButton, AbstractColumnType, AbstractEditColumnType } from './abstract-table/types';
import { DataNode } from 'rc-tree/lib/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

export type FormGroupStyle = 'normal' | 'gap' | 'tabs'

export interface OptionObject {
  label?: string,
  value?: any,
  [propName: string]: any
}

export interface PlainObject {
  [propName: string]: any
}

export interface RecordModel {
  [propName: string]: any
}

export interface TreeRecordModel extends DataNode {
  [propName: string]: any
}

export interface AbstractResponseModel<R extends AbstractRow = AbstractRow> {
  count: number
  models: Array<R>
}

export class AbstractRules {
  [propName: string]: Rule[]
}

export class AbstractFormLayout {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
}

export interface AbstractQueryType {
  pageNo: number
  pageSize: number
  sort: string,
  order: 'descend' | 'ascend' | undefined
  [x: string]: any
}

export interface AbstractRow {
  [propName: string]: any
}

export type AbstractRows = Array<AbstractRow>

export interface RVRow {
  label: string
  value: any
  [propName: string]: any
}

export type ApiRequest = () => Promise<AbstractResponseModel>

export type EnumsDataType = PlainObject | Array<RVRow>

export type RenderType<TRow> = ReactElement | ((record: TRow) => ReactElement);

export type OptionsApiRequest = [ApiRequest, string, string]

export type AbstractValueConverter = 'moment' | string | [string, ...any]

export interface AbstractActionItemContext {
  submit: () => void
  cancel: () => void
  bindValidate: (handler: Function) => (...params: any[]) => any
}

export type AbstractActionItem<TRow> = (values: TRow, context: AbstractActionItemContext) => React.ReactElement | React.ReactNode

export interface GenericKey {
  // 表单属性名
  name: string
  // 从来源值获取的值信息
  fromKey: string
}

export interface AbstractFormItemType<TRow = any> {
  // 表单id
  id?: string | number
  // 表单标题
  title: React.ReactNode
  // 是否生成for
  for?: boolean
  // 表单字段名称
  name: string | Array<string>
  // 派生映射字段，用于实现一个输入可以派生出额外的表单值，例如：下拉框组件选择后，需要同时获取id和name
  // 例如: { id:'id',name:'cityName' }
  genericKeys?: Record<string, string>
  // 组件动态key
  customKey?: (record: TRow) => string
  // 联动字段
  // 默认值
  initialValue?: any
  // 自定义表单组件 可以为一个jsx对象或者一个函数自定义渲染 默认为Input组件
  render?: RenderType<TRow>
  // 自定义一个占用整行的表单组件
  render2?: RenderType<TRow>
  // 指定表单是否可见,在不可见情况下，不会收集该字段
  visible?: boolean | ((record: TRow) => boolean)
  // 自定义值格式化 未指定时，会使用record[item.name]
  format?: (record: TRow) => any
  /**
   * 表单值转换器
   * 例如: moment 或者 ['moment','YYYY-MM-DD']
   * 具体可参考后面的 AbstractValueConverter
   */
  convert?: AbstractValueConverter | ((model: TRow) => AbstractValueConverter)
  // 是否展示为非控件模式
  textonly?: boolean
  // 是否禁用表单
  disabled?: boolean | ((record: TRow) => boolean)
  // 当前表单对应的extra 内容
  extra?: React.ReactNode | ((record: TRow) => React.ReactNode)
  // 是否显示输入反馈
  hasFeedback?: boolean
  // 关联数据变更，在当前表单数据发生改变时，可以设置其他表单数据的变化
  cascade?: (value: any, model: TRow, prevValue?: TRow) => Partial<TRow> | Promise<Partial<TRow>>
  // 当前表单输入发生改变时触发此函数
  onChange?: (...params: Array<any>) => void
  // 分组时，单个表单项FormItem的布局配置,和ant design 的FormItem对应的layout一致
  layout?: AbstractFormLayout
  // FormItem添加class
  className?: string,
  // 是否显示一个tooltip
  tooltip?: boolean
  // 设置占位信息
  placeholder?: string
  // 依赖表单
  dependencies?: NamePath[]
  // 当前表单是否需要更新
  shouldUpdate?: import('rc-field-form/lib/Field').ShouldUpdate
  // 配置
  normalize?: (value: any, prevValue: TRow, allValues: TRow) => any
  // 单独设置 span值 总计24份
  span?: number
  // 当前表单项需要再新行排版
  break?: boolean
  // 表单偏移量
  offset?: number
  // 是否出现分号，默认出现
  colon?: boolean
};

export type FunctionItemType<TRow> = (record: TRow, isReadonly: boolean) => ReactElement

export type AbstractGroupItem<TRow = any> = AbstractFormItemType<TRow> | AbstractFormGroupItemType<TRow> | FunctionItemType<TRow>

export type AbstractGroups<TRow> = AbstractGroupItem<TRow>[]

export interface AbstractFormGroupItemType<TRow = any> {
  // 控制分组是否可见
  visible?: boolean | ((record: TRow) => boolean)
  // 组图标
  icon?: ReactNode
  // 为分组时，单个表单布局占比 总计24份
  span?: number
  // 分组时，当前组的所有表单
  items?: Array<AbstractFormItemType<TRow> | FunctionItemType<TRow>>
  // 组名
  group?: ReactNode
  // 列独立布局
  layout?: AbstractFormLayout
  // 当前组是否只读
  readonly?: boolean | ((record: TRow) => boolean)
  // 表单选项的样式控制
  itemStyle?: React.CSSProperties
  // 表单组展示模式
  mode?: FormGroupStyle
  // 表单组id
  id?: string | number
}

export interface AbstractInputComponent extends React.ComponentClass<any, any>, React.FunctionComponent<any> {
  valuePropName?: string
}

export interface AbstractFormContext {
  isReadOnly?: boolean
  record: RecordModel
  // 容器宽度
  width?: number | string
  // 表单存根
  cacheGroups?: AbstractGroups<any>
  intoViewOptions?: ScrollOptions
}

export type FormScrollIntoViewOptions = ScrollOptions

export interface AbstractSField<TRow extends AbstractRow = AbstractRow> extends AbstractFormItemType<TRow> {
  /**
   * 配置当前字段为一个下拉选框搜索项
   * 格式: api:[数据源函数(返回promise),'下拉框显示字段','值字段']
   * 例如: api: [queryUserInfoList,'userName', 'userId'] },
   */
  api?: OptionsApiRequest
  // // 枚举格式化配置，配置后将根据当前列值，使用enums对象值，作为下拉框选项
  enums?: EnumsDataType
  // // 自定义字段组件 JSX组件实例 例如: form:<Input/>
  // render?: RenderType
  // 自定义搜索表单，跨度 span
  span?: number,
  // 是否开启输入内容变化时自动触发搜索。
  auto?: boolean
}

type DefaultPreview = () => React.ReactNode

export interface AbstractUploadConfig {
  media?: AbstractMediaConfig,
  // 上传公用参数
  data?: Record<string, any>
  // 共有云上传地址
  public?: string
  // 私有云上传地址
  private?: string
  onPreview?: (url: string, accept: string, onCancel: () => void, urls: string[], defaultPreview: DefaultPreview, isImage:boolean) => React.ReactNode
  onUpload?: (options: RcCustomRequestOptions, config: AbstractUploadConfig) => Promise<string>
  onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>
}

export interface AbstractMediaConfig {
  [propName: string]: {
    accept: string
    max: number
  }
}

export interface PageQueryData {
  pageNo: number
  pageSize: number
  [x: string]: any
}

export interface AbstractConfig {
  valueFormatter?: (v: any) => any
  upload?: AbstractUploadConfig
  formItemLayout?: FormItemLayout
  fetchOption?: (key: string, params: PageQueryData) => Promise<AbstractResponseModel>
}

export interface SubmitAction<TRow> {
  action: string
  model: TRow
}

export interface InitialAction {
  id: string | number
  action: string
}


// 表格Filters过滤tab数据类型
export interface FilterTabType {
  // 选项卡名称
  label: string,
  // 点击该选项卡，对应的值,用于搜索
  value: any
  //
  field?: string
}

// 表格Filters过滤数据类型
export interface AbstractFilters {
  // 搜索字段名
  name: string,
  // 所有选项卡
  tabs: Array<FilterTabType> | (() => Promise<FilterTabType[]>)
  // 当前活动的tab
  active?: string
}

export interface AbstractAction<TRow extends AbstractRow = AbstractRow> extends InitialAction {
  model?: TRow
  create?: (path: string, params?: PlainObject) => string
}

export type AbstractSFields = AbstractSField[]

export type AbstractColumns<TRow = AbstractRow> = AbstractColumnType<TRow>[]

export type AbstractEColumns<TRow> = AbstractEditColumnType<TRow>[]

export type AbstractButtons<TRow> = AbstractButton<TRow>[]

export interface AbstractMenuType {
  // 菜单名称
  title: string
  // 菜单唯一key
  key: string
  // 菜单跳转地址
  href?: string
  // 跳转a标签的target
  target?: string
  // 菜单图标
  icon?: any,
  // 菜单对应的子系统名称
  system?: string
  // 当前菜单是否为虚拟菜单,虚拟菜单不会展示，仅用于层级关联。
  virtual?: boolean,
  parent?: AbstractMenuType
  root?: AbstractMenuType
  children?: AbstractMenuType[],
  [propName: string]: any
}

export interface AbstractActionProps {
  // 当前正在编辑的数据
  record: RecordModel,
  // 当前的操作名
  action: string
  // 当前record主键名
  primaryKey: string
  // 当前动作路由数据
  routeAction: InitialAction
  // 获取表单对象
  form: React.RefObject<FormInstance>
  // 是否为只读模式
  isReadOnly: boolean
  // 提交表单
  submitAction: () => void
  // 取消编辑
  cancelAction: () => void
}


export type onValuesChangeHandler = (prevValues: RecordModel, curValues: RecordModel) => void

export interface RecordViewProps<TRow extends AbstractRow = AbstractRow, Sub = any> {
  // 当前正在编辑的数据
  record: TRow;
  // 子动作record
  subRecord: Sub
  // 当前的操作名
  action: string;
  // 子动作
  subAction?: string
  // 当前record主键名
  primaryKey: string;
  // 当前动作路由数据
  routeAction: InitialAction;
  // 获取表单对象
  form: React.RefObject<FormInstance>;
  // 是否为只读模式
  isReadOnly: boolean;
  // 提交表单
  submitAction: () => void;
  // 取消编辑
  cancelAction: () => void;
}

export interface FormItemLayout {
  labelCol: ColProps
  wrapperCol: ColProps
}

export type FormItemPadding = 'normal' | '' | 'mini'