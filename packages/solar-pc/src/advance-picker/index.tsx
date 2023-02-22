/**
 * @name AdvancePicker
 * @description
 *       用于选择外键数据
 */
import './index.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Select, Spin } from 'antd';
import { Network } from '-core';
import { SelectProps, SelectValue } from 'antd/lib/select';
import { AbstractResponseModel, OptionObject, PageQueryData, PlainObject } from '../interface';

const Option = Select.Option;
const NOOP = (a: any) => a;

const network = new Network();

type ModelRows = OptionObject[]

type ValueType = Parameters<SelectProps['onChange']>[0]

type TimerId = ReturnType<typeof setTimeout>;

type TRowModel = Record<string, string | number>

export interface OptionRow<TRow> {
  original: TRow,
  originalValue: any
  value: string
  // 是否为loading占位选项
  loading?: boolean
  label: React.ReactNode | string
}

export interface AdvancePickerProps<TRow, ValueType> extends SelectProps<ValueType> {
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
  data?: TRow[] | TRowModel
  // 默认查询参数
  query?: PlainObject
  // 值字段
  valueName?: string
  // 名称字段
  labelName?: string
  // 是否多选时通过join链接，从而达到返回一个字符串形式
  joinChar?: string
  // 当选择值改变时
  onChange?: (value: any) => void,
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
  // 自定义展示格式化
  formatLabel?: (row: OptionRow<TRow>) => React.ReactNode
  // 分页大小值
  pageSize?: number
}

const allOptionItem = { value: '', label: '全部' } as OptionRow<any>;

const fetchRemote = (url: string, data: PlainObject) => {
  return network.get<AbstractResponseModel>(url, data).json();
};

const uniqueRows = (rows: OptionRow<any>[]) => {
  const data = {} as PlainObject;
  return rows.filter((row) => {
    const exists = data[row.value];
    data[row.value] = true;
    return !exists;
  });
};

function createOption<TRow extends PlainObject>(row: TRow, valueName: string, labelName: string): OptionRow<TRow> {
  return { original: row, originalValue: row[valueName], value: `${row[valueName]}`, label: row[labelName] };
}

function createSource<TRow extends PlainObject>(data: Array<TRow> | TRowModel, valueName: string, labelName: string) {
  if (data instanceof Array) {
    // 本地配置数组初始化数据
    return data.map((row) => createOption(row, valueName, labelName));
  } else if (typeof data === 'object' && data) {
    // 本地配置枚举对象初始化数据
    return Object.keys(data).map((k) => {
      const item = data[k];
      return ({ original: item, value: `${k}`, originalValue: k, label: `${item}` }) as any as OptionRow<TRow>;
    });
  }
  return [];
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

export default function AdvancePicker<TRow = PlainObject>({
  valueMode = 'normal',
  valueName = 'value',
  labelName = 'label',
  type = 'local',
  initQuery = true,
  pageSize = 20,
  joinChar,
  ...props
}: AdvancePickerProps<TRow, SelectValue>
) {
  const [options, setOptions] = useState(createSource<TRow>(props.data, valueName, labelName));
  const [pagination, setPagination] = useState({ init: true, search: '', loading: false, page: 0, hasMore: false });
  const [tagsValue, setTagsValue] = useState('');
  const [internalValue, setInternalValue] = useState<any>();
  const [timerId, setTimerId] = useState<TimerId>();

  const nativeValue = useMemo(() => {
    const value = props.value == undefined ? internalValue : props.value;
    switch (valueMode) {
      case 'object':
        if (value instanceof Array) {
          return value.map((item: any) => item[valueName].toString());
        } else if (value && typeof value == 'object') {
          return (value as any)[valueName];
        }
        return value;
      case 'tags-single':
        return value || tagsValue;
      default:
        return value;
    }
  }, [valueMode, props.value, valueName, tagsValue, internalValue]);

  const value = useMemo(() => {
    const value = nativeValue;
    if (!props.mode) {
      // 单选
      return value ? value.toString() : value;
    }
    // 多选
    if (joinChar && typeof value === 'string') {
      // 使用连接符
      return value === '' ? undefined : (value as string).split(joinChar);
    }
    return value instanceof Array ? value : [value].filter((v) => !(v === '' || v === undefined));
  }, [joinChar, nativeValue, props.mode]);

  useEffect(() => {
    if (pagination.init) {
      initQuery && handleRemote('', false);
    } else {
      handleRemote('', false);
      return;
    }
    setPagination({ ...pagination, init: false });
  }, [pageSize]);

  useEffect(() => {
    const rows = props.data || options.map((m) => m.original);
    setOptions(createSource<TRow>(rows, valueName, labelName));
  }, [props.data, valueName, labelName]);

  // 搜索
  const thottleSearch = (value?: string) => {
    clearTimeout(timerId);
    const id = setTimeout(() => handleRemote(value, false, true), 300);
    setTimerId(id);
  };

  // 远程加载数据
  const handleRemote = (value?: string, isPagination = false, force = false) => {
    // 如果没有指定数据源，则不进行远程请求
    if (!props.api || (pagination.loading && force !== true)) return;
    // 当选择 项时也会触发 onSearch 所以为了减少不必要的请求，这里进行控制
    const { api, query = {}, format } = props;
    const page = (isPagination ? pagination.page : 0) + 1;
    query.pageNo = page;
    query.pageSize = type === 'local' ? 100 : pageSize;
    query.filter = value;
    setPagination({ ...pagination, search: value, loading: true });
    // setState({ page, loading: true, value, rows: isPagination ? allRows : [] });
    Promise
      .resolve((typeof api === 'function' ? api(query as PageQueryData) : fetchRemote(api, query)))
      .then((reponse) => {
        const result = format ? format(reponse) : reponse;
        const { count } = result || {};
        const models = (result?.models || []) as TRow[];
        const orinalRows = isPagination ? options : [];
        const rows = models.map((row) => createOption<TRow>(row, valueName, labelName));
        const allRows = uniqueRows([...orinalRows, ...rows]);
        const hasMore = count ? allRows.length < count : false;
        setPagination({ ...pagination, page, hasMore, loading: false });
        setOptions(allRows);
      });
  };

  const createValue = (value: ValueType) => {
    const isArray = value instanceof Array;
    const findOrigin = (data: ValueType) => {
      const row = options.find((r) => r.value.toString() === data);
      return row?.original || { [valueName]: data, [labelName]: data };
    };
    switch (valueMode) {
      case 'object':
        return isArray ? value.map((v) => findOrigin(v)) : findOrigin(value);
      case 'tags-single':
        const tagsValue = (isArray ? value.slice(-1)[0] : value) as string;
        setTagsValue(tagsValue);
        return tagsValue;
      case 'normal':
        return value;
    }
  };

  // 处理选择项
  const handleChange = (value: ValueType) => {
    const nativeValue = createValue(value);
    const { onChange, mode } = props;
    setInternalValue(nativeValue);
    if (mode) {
      const v = joinChar ? (nativeValue as []).join(joinChar) : nativeValue;
      return onChange && onChange(v);
    }
    if (valueMode == 'object') {
      return onChange && onChange(nativeValue);
    }
    const row = options.find((r) => r.value.toString() === value) || { originalValue: undefined as any };
    onChange && onChange(row.originalValue);
  };


  // 本地检索数据
  const handleLocal = (input: string, option: any) => {
    const children = option.props.children;
    const isString = typeof children === 'string';
    const value = input.toLowerCase();
    if (isString) {
      return children.toLowerCase().indexOf(value) >= 0;
    }
    return children.props?.children.toLowerCase().indexOf(value) >= 0;
  };

  // 处理滚动分页
  const handleScrollPagination = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // 如果正在执行分页请求，则默认滚动事件不做任何响应
    if (!pagination.loading && pagination.hasMore) {
      // 由于读取scrollTop以及scrollHeight可能会导致reflow所以分开isPaginating判断 尽可能减少ui计算
      const target = e.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollTop >= (scrollHeight - clientHeight - 50)) {
        // 如果滚动到底部，出现loading图标，此时触发刷新分页数据接口
        handleRemote(pagination.search as string, true);
      }
    }
  };

  // 渲染
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { formatLabel, format, query, prefix, data, allOption, className, api, ...rest } = props;
  // 如果时设置data 则表示一定是本地检索
  const realType = !api && props.data ? 'local' : type;
  const onSearch = realType === 'remote' ? thottleSearch : NOOP;
  const filterOption = realType === 'local' ? handleLocal : NOOP;
  const showSearch = realType !== 'none';
  const allRows = allOption ? [allOptionItem, ...options] : [...options];
  if (pagination.hasMore && pagination.loading && allRows.length > 0) {
    allRows.push({ loading: true, original: {} as TRow, originalValue: null, value: '-------------------', label: '加载中...' });
  }
  return (
    <ConfigProvider.ConfigContext.Consumer>
      {
        (ctx) => (
          <div className={`advance-picker-box ${props.size}`} >
            {
              prefix && (
                <span className={ctx.getPrefixCls('input-prefix')}>{prefix}</span>
              )
            }
            <Select
              optionLabelProp="children"
              {...rest}
              showSearch={showSearch}
              value={value}
              className={`${className} advance-picker`}
              onChange={handleChange}
              onSearch={onSearch}
              filterOption={filterOption}
              notFoundContent={pagination.loading ? <Spin /> : '无匹配数据'}
              onPopupScroll={handleScrollPagination}
            >
              {
                allRows.map((row, i) => (
                  <Option value={`${row.value}`} key={`${row.value || ''}_${i}`} label={row.label}>
                    {
                      row.loading ? <Spin size="small" /> : (formatLabel ? formatLabel(row) : row.label)
                    }
                  </Option>
                ))
              }
            </Select>
          </div>
        )
      }
    </ConfigProvider.ConfigContext.Consumer>
  );
}

AdvancePicker.Option = Select.Option;