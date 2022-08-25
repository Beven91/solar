/**
 * @name AbstractTable
 * @description
 *    后台系统，抽象列表页组件，包括：搜索条件，操作按钮，表格组件
 */
import './index.scss';
import React from 'react';
import { Table, TablePaginationConfig } from 'antd';
import memoize from 'memoize-one';
import AbstractSearch from '../abstract-search';
import TopActions from './parts/TopActions';
import CellActions from './parts/CellActions';
import Formatters from './util/formatters';
import CellRenders from './util/cellRenders';
import TabFilters from './parts/TabFilters';
import AbstractTableContext from './context';
import { AbstractTableProps, AbstractButton, SelectMode, OnActionRoute, AbstractColumns } from './types';
import { AbstractSField, AbstractQueryType, PlainObject, AbstractResponseModel } from '../interface';
import { AbstractRows, AbstractRow, AbstractAction, AbstractFilters, FilterTabType } from '../interface';

 interface SortInfo {
   field: string
   order: string
 }

export interface AbstractTableState<TRow> {
   loading: boolean
   activeTab: FilterTabType
   sort: SortInfo
   scroll: {
     x?: number | true | string;
     y?: number | string;
   },
   prevPageSize?: number
   selectedRows: TRow[],
   propsSelectedRows: TRow[]
   pageSize: number
   pageNum: number
   dataSource?: AbstractResponseModel<TRow>
   prevData?: any
 }

export default class AbstractTable<TRow extends AbstractRow> extends React.Component<AbstractTableProps<TRow>, AbstractTableState<TRow>> {
  // 默认属性值
  static defaultProps: AbstractTableProps<AbstractRow> = {
    sort: '',
    order: 'DESC',
    columns: [] as AbstractColumns<AbstractRow>,
    className: '',
    paramMode: 'scope',
    cellWidth: undefined as any,
    searchFields: [] as AbstractSField[],
    buttons: [] as AbstractButton<AbstractRow>[],
    selectedRows: [] as AbstractRows,
    pageSize: 10,
    renderTopBar: () => null as any,
    onSelectRows: (a: any) => a,
    select: 'none',
    rowKey: 'id',
    filters: {} as AbstractFilters,
    initQuery: true,
    autoHeight: false,
  };

  static Formatters = Formatters;

  static getDerivedStateFromProps(nextProps: AbstractTableProps<AbstractRow>, state: AbstractTableState<AbstractRow>) {
    const rowsChanged = nextProps.selectedRows !== state.propsSelectedRows;
    const dataChanged = nextProps.data !== state.prevData;
    if (rowsChanged || dataChanged) {
      // const data = nextProps.data;
      return {
        selectedRows: rowsChanged ? nextProps.selectedRows || [] : state.selectedRows,
        propsSelectedRows: nextProps.selectedRows,
        // dataSource: dataChanged ? (data.models || []).filter(a => !!a) : state.dataSource,
        dataSource: dataChanged ? nextProps.data : state.dataSource,
        prevData: dataChanged ? nextProps.data : state.prevData,
      };
    }
    return null;
  }

  tabsRef = React.createRef<TabFilters>();

  searchRef = React.createRef<AbstractSearch>();

  nativeQuery: PlainObject;

  sorts: PlainObject;

  query: PlainObject;

  onContextAction: OnActionRoute<TRow>;

  // 构造函数
  constructor(props: AbstractTableProps<TRow>) {
    super(props);
    this.nativeQuery = {};
    this.handleQuery = this.handleQuery.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.sorts = {};
    this.state = {
      loading: false,
      activeTab: this.defaultTab,
      sort: {
        field: props.sort,
        order: props.order,
      },
      dataSource: {} as AbstractResponseModel<TRow>,
      scroll: {},
      selectedRows: [],
      propsSelectedRows: null,
      pageSize: props.pageSize,
      pageNum: 1,
    };
  }

  tableInnerRef = React.createRef<HTMLDivElement>();

  getRowKey(row: TRow, index: number) {
    const { rowKey } = this.props;
    if (typeof rowKey === 'function') {
      return rowKey(row, index) as string;
    }
    return rowKey as string;
  }

  // 操作列
  get operatorColumn() {
    const { operation } = this.props;
    const operateWidth = (operation || {}).width;
    const style = { width: operateWidth };
    const operators = this.cellOperators;
    return {
      title: '操作',
      fixed: 'right',
      ...(operation || {}),
      dataIndex: 'cell-operator',
      name: 'cell-operator',
      width: operateWidth,
      render: (text: string, row: TRow, index: number) => (
        <CellActions
          row={row}
          rowIndex={index}
          onAction={this.onAction}
          style={style}
          buttons={operators}
          rowId={row[this.getRowKey(row, index)]}
        />
      ),
    } as any;
  }

  // 渲染列配置
  get columns() {
    const columns = [...(this.props.columns || [])];
    if (this.cellOperators.length > 0) {
      // 添加操作列
      columns.push(this.operatorColumn);
    }
    const { sort, order, cellWidth } = this.props;
    const element = this.tableInnerRef.current;
    const clientWidth = element ? element.clientWidth : 0;
    const defaultWidth = cellWidth ?
      cellWidth :
      CellRenders.remainColumnWidth(columns, clientWidth);
    // 列配置
    return columns.map(column => {
      // 排序配置
      this.sorts[column.name] = column.sort;
      const { width, ellipsis } = column;
      return {
        ...column,
        key: `col-${column.name}`,
        width: width || defaultWidth,
        ellipsis: ellipsis === undefined ? true : ellipsis,
        render: CellRenders.getRender<TRow>(column),
        className: `column-${column.name}`,
        dataIndex: column.name || column.dataIndex,
        defaultSortOrder: sort === column.sort ? order : undefined,
        sorter: !!this.sorts[column.name],
      };
    });
  }

  // 获取需要显示在表格，操作列中的按钮
  get cellOperators() {
    const { buttons = [] } = this.props;
    return buttons.filter(b => b.target === 'cell');
  }

  // 获取需要显示在表格外面的操作按钮
  get topOperators() {
    const { buttons = [] } = this.props;
    return buttons.filter(b => b.target !== 'cell');
  }

  // 分页配置
  get pagination() {
    const { dataSource } = this.state;
    const { pageNum, pageSize } = this.state;
    const total = dataSource ? dataSource.count || 0 : 0;
    return {
      current: pageNum,
      pageSize,
      total: total,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  // 默认tab过滤箱
  get defaultTab() {
    const filters = this.props.filters || {} as AbstractFilters;
    const tabs = typeof filters.tabs === 'function' ? [] : filters.tabs || [];
    if (filters.active == null) {
      return (tabs[0] || {}).value || '';
    }
    return filters.active;
  }

  onAction = (action: AbstractAction<TRow>) => {
    const { onActionRoute } = this.props;
    if (onActionRoute) {
      onActionRoute(action);
    } else if (this.onContextAction) {
      this.onContextAction(action);
    }
  };

  // 行选中操作
  getRowSelection = memoize((select: SelectMode, rowKey: any, selectedRows: TRow[]) => {
    const selectedRowKeys = selectedRows.map((row: TRow) => row[this.getRowKey(row, -1)]);
    const shouldSelect = select && select != 'none' || this.topOperators.find(op => !!op.select);
    return shouldSelect ?
      {
        selectedRowKeys,
        type: (select === 'single' ? 'radio' : 'checkbox') as any,
        onSelect: this.handleSelectRow,
        onSelectAll: this.handleSelectAll,
      } :
      null;
  });

  // 初始化刷新数据
  componentDidMount() {
    this.query = {};
    if (this.props.initQuery) {
      this.refresh();
    }
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentDidUpdate(prevProps: Readonly<AbstractTableProps<TRow>>, prevState: Readonly<AbstractTableState<TRow>>, snapshot?: any): void {
    if (prevProps.filters?.active !== this.props.filters?.active) {
      this.tabsRef.current?.changeActiveTab(this.props.filters?.active);
    }
  }

  // 组件销毁
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  // 刷新滚动高度
  handleResize = () => {
    if (this.props.autoHeight) {
      return;
    }
    const element = this.tableInnerRef.current;
    const height = element ? element.clientHeight : 0;
    this.setState({
      scroll: {
        x: '100%',
        y: height - 64 - 54,
      },
    });
  };

  // 选择行
  handleSelectRow = (row: TRow, selected: boolean) => {
    const { selectedRows } = this.state;
    const { onSelectRows, select } = this.props;
    const single = select === 'single';
    let newSelectedRows = [...selectedRows];
    if (single) {
      // 单选
      newSelectedRows = [row];
    } else if (selected) {
      // 多选
      newSelectedRows.push(row);
    } else {
      // 取消选中
      newSelectedRows = selectedRows.filter(
        row2 => row2[this.getRowKey(row2, -1)] != row[this.getRowKey(row, -1)]
      );
    }
    this.setState({ selectedRows: newSelectedRows });
    onSelectRows && onSelectRows(newSelectedRows);
  };

  // 取消或者选中所有行
  handleSelectAll = (selected: boolean, sRows: TRow[], changeRows: TRow[]) => {
    const { selectedRows } = this.state;
    const { onSelectRows } = this.props;
    let newSelectedRows = [...selectedRows];
    if (selected) {
      newSelectedRows.push(...changeRows);
    } else {
      const changeRowKeys = changeRows.reduce((all, row) => {
        all[row[this.getRowKey(row, -1)]] = row;
        return all;
      }, {} as any);
      newSelectedRows = selectedRows.filter(row => !changeRowKeys[row[this.getRowKey(row, -1)]]);
    }
    this.setState({ selectedRows: newSelectedRows });
    if (onSelectRows) {
      onSelectRows(newSelectedRows);
    }
  };

  // 刷新数据
  refresh() {
    this.handleQuery();
  }

  getInitialQuery() {
    const searcher = this.searchRef.current;
    const query = {
      ...(searcher ? searcher.getQueryValues() : {}),
    };
    this.query = query;
    this.nativeQuery = query;
    return query;
  }

  handleTabFilter = (tab: FilterTabType) => {
    const activeTab = this.state.activeTab;
    if (this.query && activeTab) {
      // 如果指定tab使用了自定义name 则这里需要将之前选择的tab的查询字段值移除
      delete this.query[activeTab.field];
    }
    this.setState({ activeTab: tab }, () => this.handleQuery());
  };

  // 处理tab搜索
  applyTabQueryFilter = () => {
    const filters = this.props.filters || {} as AbstractFilters;
    if (!filters.tabs) return;
    const tab = this.state.activeTab;
    const name = (tab ? tab.field : '') || filters.name;
    this.query = this.query || {};
    this.nativeQuery[name] = this.query[name] = tab;
  };

  // 搜索
  handleSearch(query: AbstractQueryType) {
    this.query = query;
    this.nativeQuery = query;
    this.setState({ pageNum: 1 }, () => {
      this.handleQuery();
    });
  }

  paginateIntoView(total: number) {
    const { pageSize } = this.state;
    const pageNum = Math.ceil(total / pageSize);
    if (pageNum > this.state.pageNum) {
      this.paginateTo(pageNum);
    }
  }

  reload() {
    this.handleQuery();
  }

  // 跳转到指定页
  paginateTo(pageNum: number) {
    this.setState({ pageNum: pageNum }, () => this.handleQuery());
  }

  onPaginateChanged = (e: TablePaginationConfig, filter?: any, order?: any) => {
    this.setState({ pageNum: e.current, pageSize: e.pageSize, sort: order }, () => {
      this.handleQuery();
    });
  };

  // 分页，排序
  handleQuery() {
    const { onQuery, paramMode } = this.props;
    const sort = this.state.sort;
    const desc = sort?.order === 'descend';
    if (typeof onQuery === 'function') {
      const field = this.sorts[sort.field] || sort.field;
      const query = this.query || {};
      this.applyTabQueryFilter();
      const res = onQuery({
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize,
        sort: field,
        order: field ? (desc ? 'descend' : 'ascend') : undefined,
        ...(paramMode === 'mix' ? query : { query: this.nativeQuery }),
      });
      Promise.resolve(res as any).then((data) => {
        if (data && data.models instanceof Array) {
          this.setState({ dataSource: data });
        }
      });
    }
  }

  // 渲染
  render() {
    const {
      searchFields,
      className,
      filters,
      children,
      renderTopBar,
      rowKey,
      style,
      loading,
      select,
      autoHeight,
      searchBoxCls,
      buttonBoxCls,
      searchBoxActionCls,
      ...others
    } = this.props;
    const { scroll, selectedRows, dataSource } = this.state;
    const topActions = this.topOperators;
    const topClass = topActions.length > 0 ? 'has-top-actions' : '';
    const heightCls = autoHeight ? 'auto-height' : '';
    const columns = this.columns;
    const tabs = typeof filters.tabs === 'function' ? null : filters.tabs;
    const loadFilters = typeof filters.tabs === 'function' ? filters.tabs : null;
    return (
      <AbstractTableContext.Consumer>
        {
          ({ onAction }) => {
            this.onContextAction = onAction;
            return (
              <div
                className={`${className} ${topClass} ${heightCls} abstract-table-wrapper abstract-flex`}
                style={style}
              >
                {children && children}
                <AbstractSearch
                  ref={this.searchRef}
                  fields={searchFields}
                  className={searchBoxCls}
                  actionsCls={searchBoxActionCls}
                  onQuery={this.handleSearch}
                  {...(this.props.searchOptions || {})}
                >
                  <TopActions
                    className={buttonBoxCls}
                    onAction={this.onAction}
                    buttons={topActions}
                    renderTopBar={renderTopBar}
                    selectedRows={selectedRows}
                  />
                </AbstractSearch>
                <div className="abstract-table abstract-flex">
                  <TabFilters
                    ref={this.tabsRef}
                    loadFilters={loadFilters}
                    onChange={this.handleTabFilter}
                    value={this.state.activeTab}
                    filters={tabs}
                  />
                  <div className="abstract-flex" ref={this.tableInnerRef}>
                    <Table
                      rowKey={rowKey}
                      loading={loading}
                      scroll={scroll}
                      pagination={this.pagination}
                      {...others}
                      dataSource={dataSource?.models?.filter((a) => !!a)}
                      onChange={this.onPaginateChanged}
                      className={'abstract-flex abstract-table-inner'}
                      rowSelection={this.getRowSelection(select, rowKey, selectedRows)}
                      columns={columns as any}
                    />
                  </div>
                </div>
              </div>
            );
          }
        }
      </AbstractTableContext.Consumer>
    );
  }
}

