/**
 * @name AdvancePicker
 * @description
 *       用于选择外键数据
 */
import './index.scss';
import React from 'react';
import { Select, Spin } from 'antd';
import { Network } from 'solar-core';
import { SelectProps, SelectValue } from 'antd/lib/select';
import { AbstractResponseModel, OptionObject, PageQueryData, PlainObject } from '../interface';

const Option = Select.Option;
const NOOP = (a: any) => a;

const network = new Network();

type ModelRows = OptionObject[]

export interface AdvancePickerProps<ValueType> extends SelectProps<ValueType> {
  /**
   * remote:  远程检索 默认值 ，
   * local 本地检索
   * none 无检索模式
   * 可以设置本地检索  'local'(推荐本地模式 在接口数据小于100条时使用此模式)
   */
  type?: 'remote' | 'local' | 'none'
  /**
   * 值模式
   * normal: 选择的值为字段值
   * object: 选择的值为选择的对象
   * tags-single: 单选的tags
   */
  valueMode?: 'normal' | 'object' | 'tags-single'
  // 自定义数据获取，支持接口请求。
  api?: ((query: PageQueryData) => Promise<AbstractResponseModel>) | string
  // 本地数据源
  data?: ModelRows
  // 默认查询参数
  query?: PlainObject
  // 值字段
  valueName?: string
  // 名称字段
  labelName?: string
  // 是否多选时通过join链接，从而达到返回一个字符串形式
  joinChar?: string
  // 当选择值改变时
  onChange?: (value: any, row: PlainObject) => void,
  // 是否默认生成 【全部】 选项
  allOption?: boolean
  // 格式化返回值
  format?: (response: any) => AbstractResponseModel,
  // 是否禁用
  disabled?: boolean
  // 前缀图标
  prefix?: React.ReactNode
  // 在api模式下，初始化时是否调用查询接口,默认为:true
  initQuery?: boolean
}

export interface AdvancePickerState {
  // 搜索条件
  value: SelectValue
  // 是否正在加载中
  loading: boolean
  // 当前页码值
  page: number
  // 是否还有更多数据
  hasMore: boolean
  // 当前数据
  rows: ModelRows
}

export default class AdvancePicker extends React.Component<AdvancePickerProps<SelectValue>, AdvancePickerState> {
  // 组件属性定义
  static propTypes = {

    // 其他属性 可以参照Select组件
  };

  static Option = Select.Option;

  // 默认属性值
  static defaultProps: AdvancePickerProps<SelectValue> = {
    api: null as any,
    query: {},
    onChange: () => '',
    disabled: false,
    valueMode: 'normal',
    valueName: 'value',
    labelName: 'label',
    type: 'remote',
    initQuery: true,
    data: null as any,
    allOption: false,
    format: (r: any) => r || {},
  };

  // 默认的fetch实现
  static fetch(url: string, data: PlainObject) {
    return network.get<AbstractResponseModel>(url, data).json();
  }

  searching: boolean;

  // 默认状态
  state = {
    // 搜索条件
    value: null as SelectValue,
    // 是否正在加载中
    loading: false,
    // 当前页码值
    page: 0,
    // 是否还有更多数据
    hasMore: false,
    // 当前数据
    rows: [] as OptionObject[],
  };

  tagsValue = undefined as string;

  get allOption() {
    return {
      value: '',
      label: '全部',
    };
  }

  get nativeValue() {
    const { value, valueName } = this.props;
    switch (this.props.valueMode) {
      case 'object':
        if (value instanceof Array) {
          return value.map((item: any) => item[valueName].toString());
        } else if (value && typeof value == 'object') {
          return (value as any)[valueName];
        }
        return value;
      case 'tags-single':
        return value || this.tagsValue;
      default:
        return value;
    }
  }

  get value() {
    const { joinChar } = this.props;
    const value = this.nativeValue;
    if (!this.props.mode) {
      return value ? value.toString() : value;
    }
    if (joinChar && typeof value === 'string') {
      return value === '' ? undefined : value.split(joinChar);
    }
    return value;
  }

  componentDidMount() {
    const { initQuery, api } = this.props;
    if (initQuery == false && api) return;
    this.loadAsync();
  }

  componentDidUpdate(prevProps: Readonly<AdvancePickerProps<SelectValue>>, prevState: Readonly<AdvancePickerState>, snapshot?: any): void {
    if (prevProps.data !== this.props.data) {
      this.loadAsync();
    }
  }

  // 如果是第一次进行，则加载一次数据
  loadAsync() {
    const { data } = this.props;
    if (data instanceof Array) {
      // 本地配置数组初始化数据
      const rows = data.map((row) => this.handleRow(row));
      this.setState({ rows, loading: false });
    } else if (typeof data === 'object' && data) {
      // 本地配置枚举对象初始化数据
      const rows = Object.keys(data).map((k) => {
        const item = data[k];
        return ({ value: item, originalValue: item, label: k });
      });
      this.setState({ rows, loading: false });
    } else {
      // 远程初始化数据
      this.handleRemote();
    }
  }

  findOrigin(value: any) {
    const { rows } = this.state;
    const { valueName, labelName } = this.props;
    const row = rows.find((r) => r.value.toString() === value);
    return row?.original || { [valueName]: value, [labelName]: value };
  }

  createValue(value: SelectValue) {
    const isArray = value instanceof Array;
    switch (this.props.valueMode) {
      case 'object':
        return isArray ? value.map((v) => this.findOrigin(v)) : this.findOrigin(value);
      case 'tags-single':
        this.tagsValue = (isArray ? value.slice(-1)[0] : value) as string;
        return this.tagsValue;
      case 'normal':
        return value;
    }
  }

  // 处理选择项
  handleChange = (value: SelectValue) => {
    this.searching = true;
    const { rows } = this.state;
    const nativeValue = this.createValue(value);
    const { onChange, joinChar, mode } = this.props;
    if (mode) {
      const v = joinChar ? (nativeValue as []).join(joinChar) : nativeValue;
      return onChange && onChange(v, {});
    }
    if (this.props.valueMode == 'object') {
      return onChange && onChange(nativeValue, { original: nativeValue });
    }
    const row = rows.find((r) => r.value.toString() === value) || { originalValue: undefined as any };
    onChange && onChange(row.originalValue, row);
  };

  // 远程搜索数据
  handleRemote = (value?: string, isPagination = false) => {
    // 当选择 项时也会触发 onSearch 所以为了减少不必要的请求，这里进行控制
    if (!this.searching) {
      const { page: pageIndex, rows: allRows } = this.state;
      const { api, query = {}, type, format } = this.props;
      const page = (isPagination ? pageIndex : 0) + 1;
      query.pageNo = page;
      query.pageSize = type === 'local' ? 100 : 20;
      query.filter = value;
      this.setState({ page, loading: true, value, rows: isPagination ? allRows : [] });
      const res = typeof api === 'function' ? api(query as PageQueryData) : AdvancePicker.fetch(api, query);
      Promise
        .resolve(res)
        .then((reponse) => {
          const result = format(reponse);
          const { models = [], count } = result || {};
          const orinalRows = isPagination ? this.state.rows : [];
          const rows = (models || []).map((row) => this.handleRow(row));
          const allRows = this.uniqueRows(orinalRows.concat(rows));
          const hasMore = count ? allRows.length < count : false;
          this.setState({ hasMore, rows: allRows, loading: false });
        });
    }
    this.searching = false;
  };

  // 去重数据源
  uniqueRows(rows: ModelRows) {
    const data = {} as PlainObject;
    return rows.filter((row) => {
      const exists = data[row.value];
      data[row.value] = true;
      return !exists;
    });
  }

  // 格式化选项值
  handleRow(row: PlainObject) {
    const { valueName, labelName } = this.props;
    return { original: row, originalValue: row[valueName], value: `${row[valueName]}`, label: row[labelName] };
  }

  // 本地检索数据
  handleLocal(input: string, option: any) {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  // 频率控制函数
  throttle(handler: Function) {
    let id = null as any;
    return (...args: Array<any>) => {
      clearTimeout(id);
      id = setTimeout(() => handler(...args), 200);
    };
  }

  // 处理滚动分页
  handleScrollPagination = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // 如果正在执行分页请求，则默认滚动事件不做任何响应
    if (!this.state.loading && this.state.hasMore) {
      // 由于读取scrollTop以及scrollHeight可能会导致reflow所以分开isPaginating判断 尽可能减少ui计算
      const target = e.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollTop >= (scrollHeight - clientHeight - 50)) {
        // 如果滚动到底部，出现loading图标，此时触发刷新分页数据接口
        this.handleRemote(this.state.value as string, true);
      }
    }
  };

  // 渲染
  render() {
    const { loading, rows = [], hasMore } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { valueMode, initQuery, format, query, prefix, data, type, allOption, className, api, labelName, valueName, ...props } = this.props;
    // 如果时设置data 则表示一定时本地检索
    const realType = !api && this.props.data ? 'local' : type;
    const handleRemote = realType === 'remote' ? this.handleRemote : NOOP;
    const handleLocal = realType === 'local' ? this.handleLocal : NOOP;
    const showSearch = realType !== 'none';
    const allRows = allOption ? [this.allOption, ...rows] : [...rows];
    if (hasMore && loading && allRows.length > 0) {
      allRows.push({ api, format, valueName, labelName, value: '-------------------', label: '加载中...', loading: true });
    }

    return (
      <div className={`advance-picker-box ${props.size}`} >
        {
          prefix && (
            <span className="ant-input-prefix">{prefix}</span>
          )
        }
        <Select
          {...props}
          showSearch={showSearch}
          value={this.value}
          className={`${className} advance-picker`}
          onChange={this.handleChange}
          onSearch={handleRemote}
          filterOption={handleLocal}
          optionLabelProp="children"
          notFoundContent={loading ? <Spin /> : '无匹配数据'}
          onPopupScroll={this.handleScrollPagination}
        >
          {
            allRows.map((row, i) => (
              <Option value={`${row.value}`} key={`${row.value || ''}_${i}`}>
                {
                  row.loading ? <Spin size="small" /> : row.label
                }
              </Option>
            ))
          }
        </Select>
      </div>
    );
  }
}

