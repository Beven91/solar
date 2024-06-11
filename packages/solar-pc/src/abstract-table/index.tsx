/**
 * @name AbstractTable
 * @description
 *    后台系统，抽象列表页组件，包括：搜索条件，操作按钮，表格组件
 */
import './index.scss';
import React, { useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Table, TablePaginationConfig } from 'antd';
import AbstractSearch, { AbstractSearchProps } from '../abstract-search';
import TopActions from './parts/TopActions';
import CellActions from './parts/CellActions';
import Formatters2 from './util/formatters';
import CellRenders from './util/cellRenders';
import TabFilters from './parts/TabFilters';
import AbstractTableContext from './context';
import { AbstractTableProps, AbstractColumnType } from './types';
import { AbstractResponseModel } from '../interface';
import { AbstractRow, AbstractAction, FilterTabType } from '../interface';
import useScrollResizeable from './hooks/use-scroll-resizeable';
import { FormInstance } from 'antd/lib/form';
import { SorterResult } from 'antd/lib/table/interface';
import { useInjecter } from '../abstract-injecter';
import DrawerFilter from './parts/DrawerFilter';

function Title(props: { column: AbstractColumnType<any>, inject: boolean }) {
  const column = props.column;
  const injecter = useInjecter(props.inject);
  return (
    <div
      className="abstract-table-column column-th"
      onDoubleClick={() => injecter?.listener?.onColumnDbClick?.(column)}
    >{column.title}
    </div>
  );
}

interface SortMeta {
  field: string
  order: string
  column: {
    sort: string
  }
}

export const Formatters = Formatters2;

export interface AbstractTableInstance {
  paginateIntoView: (total: number) => void
  reload: () => void
  pagination: { pageNo: number, pageSize: number },
  paginateTo: (pageNo: number) => void,
}

export default React.forwardRef(function AbstractTable<TRow extends AbstractRow>({
  order = 'descend',
  paramMode = 'scope',
  pageSize = 10,
  select = 'none',
  rowKey = 'id',
  layoutMode = 'normal',
  initQuery = true,
  initialPageIndex = 1,
  extraNode,
  buttons = [],
  inject,
  ...props
}: AbstractTableProps<TRow>,
ref: React.MutableRefObject<AbstractTableInstance>
) {
  const [memo] = useState({
    isInitQuery: true,
    currentTab: null as FilterTabType,
    pageNo: initialPageIndex,
    pageSize,
    selectedRows: [] as TRow[],
    sort: { order: order, column: { sort: props.sort } } as SortMeta,
  });
  const [dataSource, setDataSource] = useState<AbstractResponseModel<TRow>>(props.data);
  const searchFormRef = useRef<FormInstance>();
  const containerRef = useRef<HTMLDivElement>();
  const tableInnerRef = useRef<HTMLDivElement>();
  const tableContext = useContext(AbstractTableContext);
  const overflow = useScrollResizeable(props.autoHeight, containerRef, tableInnerRef, props.size, props.pagination !== false);
  const selectedRows = props.selectedRows || memo.selectedRows;
  const [updateId, setUpdateId] = useState(0);
  const useInnerLoading = !('loading' in props);
  const [innerLoading, setInnerLoading] = useState(props.loading);
  const { drawer, ...sOptions } = (props.searchOptions || {});
  const searchOptions = useMemo(() => {
    return {
      ...sOptions,
      btnQuery: {
        ...(sOptions?.btnQuery || {}),
        loading: innerLoading,
      },
    };
  }, [props.searchOptions, innerLoading]);

  useEffect(() => {
    setInnerLoading(props.loading);
  }, [props.loading]);

  const tablePagination = useMemo(() => {
    if (props.pagination == false) {
      return false;
    }
    const total = dataSource?.count || 0;
    return {
      current: memo.pageNo,
      pageSize: memo.pageSize,
      total: total,
      pageCount: Math.ceil(total / pageSize),
      showSizeChanger: true,
      ...(props.pagination || {}),
    };
  }, [memo.pageNo, memo.pageSize, dataSource, props.pagination]);

  const getRowKey = (row: TRow, index: number) => {
    const isFn = typeof rowKey == 'function';
    return (isFn ? rowKey(row, index) : rowKey) as string;
  };

  const onAction = (action: AbstractAction<TRow>) => {
    const onActionRoute = props.onActionRoute || tableContext.onAction;
    onActionRoute?.(action);
  };

  // 获取需要显示在表格，操作列中的按钮
  const cellOperators = useMemo(() => (buttons || []).filter(b => b.target === 'cell'), [buttons]);

  // 获取需要显示在表格外面的操作按钮
  const topOperators = useMemo(() => (buttons || []).filter(b => b.target !== 'cell'), [buttons]);

  // 选中行信息
  const rowSelection = useMemo(() => {
    const { onSelectRows } = props;
    const selectedRowKeys = selectedRows.map((row) => row[getRowKey(row, -1)]);
    const shouldSelect = select && select != 'none' || topOperators.find(op => !!op.select);
    if (!shouldSelect) return null;
    return {
      selectedRowKeys,
      type: (select === 'single' ? 'radio' : 'checkbox') as any,
      onSelect: (row: TRow, selected: boolean) => {
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
            row2 => row2[getRowKey(row2, -1)] != row[getRowKey(row, -1)]
          );
        }
        memo.selectedRows = newSelectedRows;
        onSelectRows?.(newSelectedRows);
        if (!('selectedRows' in props)) {
          setUpdateId(updateId + 1);
        }
      },
      onSelectAll: (selected: boolean, sRows: TRow[], changeRows: TRow[]) => {
        let newSelectedRows = [...selectedRows];
        if (selected) {
          newSelectedRows.push(...changeRows);
        } else {
          const changeRowKeys = changeRows.reduce((all, row) => {
            all[row[getRowKey(row, -1)]] = row;
            return all;
          }, {} as any);
          newSelectedRows = selectedRows.filter(row => !changeRowKeys[row[getRowKey(row, -1)]]);
        }
        memo.selectedRows = newSelectedRows;
        onSelectRows?.(newSelectedRows);
        if (!('selectedRows' in props)) {
          setUpdateId(updateId + 1);
        }
      },
      ...(props.rowSelection || {}),
    };
  }, [selectedRows, select, topOperators, props.onSelectRows, props.rowSelection]);

  // 操作列
  const operatorColumn = useMemo(() => {
    const { operation } = props;
    const operateWidth = (operation || {}).width || 160;
    const style = {};
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
          onAction={onAction}
          style={style}
          buttons={cellOperators}
          rowId={row[getRowKey(row, index)]}
        />
      ),
    } as any;
  }, [props.operation, cellOperators, props.onActionRoute, tableContext.onAction]);

  // 渲染列配置
  const columns = useMemo(() => {
    const columns = [...(props.columns || [])];
    if (cellOperators.length > 0) {
      const index = props.operation?.index;
      index >= 0 ? columns.splice(index, 0, operatorColumn) : columns.push(operatorColumn);
    }
    const { sort, cellWidth } = props;
    const element = tableInnerRef.current;
    const clientWidth = element ? element.clientWidth : 0;
    const defaultWidth = cellWidth ?
      cellWidth :
      CellRenders.remainColumnWidth(columns, clientWidth);
    // 列配置
    return columns.map(column => {
      // 排序配置
      const { width, ellipsis } = column;
      return {
        ...column,
        title: <Title column={column} inject={inject} />,
        key: `col-${column.name}`,
        width: width || defaultWidth,
        ellipsis: ellipsis === undefined ? true : ellipsis,
        render: CellRenders.getRender<TRow>(column),
        className: `column-${column.name}`,
        dataIndex: column.name || column.dataIndex,
        defaultSortOrder: sort === column.sort ? order : undefined,
        sorter: column.sort !== undefined ? true : false,
      };
    });
  }, [props.columns, props.cellWidth, props.sort, cellOperators, operatorColumn, inject]);

  // 分页，排序
  const handleQuery = (pageNo: number, pageSize: number, sort: SortMeta, callback?: (data: any) => void) => {
    memo.pageNo = pageNo;
    memo.pageSize = pageSize;
    memo.sort = sort;
    const currentTab = memo.currentTab;
    const { onQuery } = props;
    if (typeof onQuery !== 'function') {
      callback?.(undefined);
      return;
    }
    useInnerLoading && setInnerLoading(true);
    // 获取搜索框填写的表单值
    const query = searchFormRef.current?.getFieldsValue() || {};
    // 如果有选中标签
    if (currentTab) {
      query[currentTab.field] = currentTab.value;
    }
    Object.keys(query).forEach((k) => {
      if (query[k] === undefined) {
        delete query[k];
      }
    });
    const sortName = sort?.column?.sort;
    const res = onQuery({
      pageNo: pageNo,
      pageSize: pageSize,
      sort: sortName,
      order: sortName ? sort?.order : undefined,
      ...(paramMode === 'mix' ? query : { query: query }),
    });
    Promise.resolve(res as any).then((data: AbstractResponseModel<TRow>) => {
      callback?.(data);
      if (data && data.models instanceof Array) {
        setDataSource(data);
      }
    }).finally(() => {
      useInnerLoading && setInnerLoading(false);
    });
  };

  useEffect(() => {
    memo.isInitQuery = false;
    if (initQuery) {
      // 初始化查询
      handleQuery(memo.pageNo, memo.pageSize, memo.sort);
    }
  }, []);

  useEffect(() => {setDataSource(props.data);}, [props.data]);

  useImperativeHandle(ref, () => {
    const paginateTo = (pageNo: number) => {
      memo.pageNo = pageNo;
      handleQuery(pageNo, memo.pageSize, memo.sort);
    };
    return {
      paginateIntoView: (total: number) => {
        const { pageSize } = memo;
        const pageNo = Math.ceil(total / pageSize);
        if (pageNo > memo.pageNo) {
          paginateTo(pageNo);
        }
      },
      pagination: memo,
      // 重新记载表格数据
      reload: () => {
        onSearch();
      },
      // 跳转到指定页
      paginateTo: paginateTo,
    };
  });

  // 搜索
  const onSearch = () => {
    handleQuery(1, memo.pageSize, memo.sort);
  };

  // 切换tab栏
  const onTabFilter = (tab: FilterTabType) => {
    memo.currentTab = tab;
    if (!memo.isInitQuery) {
      onSearch();
    }
  };

  // 分页
  const onPagination = (config: TablePaginationConfig, filters: Record<string, any>, sorter: SorterResult<any> | SorterResult<any>[]) => {
    handleQuery(config.current, config.pageSize, sorter as SortMeta, (data) => {
      if (data == undefined) {
        setDataSource({ ...dataSource });
      }
    });
  };

  // 渲染
  const {
    searchFields,
    className,
    filters,
    children,
    renderTopBar,
    style,
    autoHeight,
    searchBoxCls,
    buttonBoxCls,
    searchBoxActionCls,
    getActionsContainer,
    ...others
  } = props;
  const lessCls = overflow.isLess ? 'scrollable' : '';
  const topClass = topOperators.length > 0 ? 'has-top-actions' : '';
  const heightCls = autoHeight ? 'auto-height' : '';
  const tabs = typeof filters?.tabs === 'function' ? null : filters?.tabs;
  const loadFilters = typeof filters?.tabs === 'function' ? filters?.tabs : null;
  const showFilters = filters || loadFilters;
  const injecter = useInjecter(inject);
  const onlyTable = (!showFilters && topOperators.length < 1);

  const renderSearch = (props?: Partial<AbstractSearchProps<TRow>>) => {
    return (
      <AbstractSearch
        fields={searchFields}
        className={searchBoxCls}
        actionsCls={searchBoxActionCls}
        inject={inject}
        {...props}
        {...(searchOptions)}
        onQuery={(query) => {
          onSearch();
          props.onQuery?.(query);
        }}
        formRef={searchFormRef}
      >
      </AbstractSearch>
    );
  };

  const topGetContainer = getActionsContainer || tableContext.getActionsContainer;
  const hasSelfTopActions = topOperators?.length > 0 && typeof topGetContainer !== 'function';

  return (
    <div
      ref={containerRef}
      className={`${className || ''} ${lessCls} ${topClass} ${heightCls} abstract-table-wrapper abstract-flex table-layout-${layoutMode || 'normal'} ${hasSelfTopActions ? '' : 'no-self-top-actions'}`}
      style={style}
    >
      {children && children}
      {layoutMode == 'mini' ? null : renderSearch()}
      <div className={`abstract-table abstract-flex ${onlyTable ? 'only-table' : ''}`}>
        <div className="top-actions-wrapper">
          <TopActions
            className={buttonBoxCls}
            onAction={onAction}
            buttons={topOperators}
            getContainer={topGetContainer}
            renderTopBar={renderTopBar}
            selectedRows={selectedRows}
          />
          {
            layoutMode == 'mini' && (
              <DrawerFilter {...drawer} search={renderSearch} />
            )
          }
        </div>
        {extraNode}
        {
          showFilters && (
            <TabFilters
              name={filters?.name}
              loadFilters={loadFilters}
              onChange={onTabFilter}
              value={filters?.active}
              filters={tabs}
            />
          )
        }
        <div className="abstract-flex" ref={tableInnerRef}>
          <Table
            rowKey={rowKey}
            scroll={autoHeight ? { x: '100%' } : overflow.scroll}
            {...others}
            loading={innerLoading}
            pagination={tablePagination}
            dataSource={dataSource?.models?.filter((a) => !!a)}
            onChange={onPagination}
            className={'abstract-flex abstract-table-inner'}
            rowSelection={rowSelection}
            columns={columns as any}
          />
        </div>
        {injecter?.node?.appendAbstractTableInner?.()}
      </div>
    </div>
  );
}) as any as (<TRow>(props: AbstractTableProps<TRow> & React.RefAttributes<AbstractTableInstance>) => React.ReactElement);
