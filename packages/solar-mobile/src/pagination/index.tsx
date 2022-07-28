/**
 * 名称：滚动视图（支持滚动分页)
 * 日期：2018-03-06
 * 描述：基于antd-mobile的ListView实现的滚动分页组件，
 *      目前暂时实现下拉滚动滚动分页
 */

import './index.scss';
import React from 'react';
import { ListView, Icon } from 'antd-mobile';
import ScrollPortalView from './ScrollPortalView';
import ReverseListView from './ReverseListView';
import { ListViewProps } from 'antd-mobile/lib/list-view';

export interface EndReachedEvent {
  page: number
  size: number
}

export interface PaginationProps extends ListViewProps {
  // 当前页面
  initialPage: number,
  // 是否为为增量模式
  increment?: boolean,
  // 是否还有更多数据
  hasMore?: boolean,
  // class样式
  className?: string,
  // 当滚动到底部时触发次函数，用于执行分页操作
  onEndReached: (e: EndReachedEvent) => void,
  // 自定义判定行数据是否发生改变 例如:  (row1,row2)=> row1 !== row2;
  equalRow?: (row1: any, row2: any) => boolean,
  // 过滤条件函数
  filter?: (row: any, index: number) => boolean,
  // 自定义滚动容器
  getScrollContainer?: () => HTMLElement,
  // 滚动方向
  direction?: 'normal' | 'bottom-to-top',
}

export interface PaginationState {
  // 当前页码值
  page: number
  isPaginating: boolean
  dataSource: any
}

export default class Pagination extends React.Component<PaginationProps, PaginationState> {
  // 默认属性值
  static defaultProps = {
    initialPage: 0,
    data: [] as Array<any>,
    increment: true,
    renderFooter: () => (
      <div className="scroll-end-loading">
        <Icon type="loading" className="loading-icon" size="xxs" />
        <span className="loading-text">加载中，请稍后....</span>
      </div>
    ),
    equalRow: (row1: any, row2: any) => row1 !== row2,
  };

  private all: Array<any>

  constructor(props: PaginationProps) {
    super(props);
    const { initialPage } = props;
    this.all = props.dataSource;
    this.state = {
      // 当前页码值
      page: initialPage,
      // 是否在分页中
      isPaginating: false,
      // 分页加载的数据源
      dataSource: new ListView.DataSource({
        rowHasChanged: this.props.equalRow,
      }).cloneWithRows(this.handleFilter(this.all)),
    };
    this.onEndReached = this.onEndReached.bind(this);
  }

  /**
   * 初始化加载数据
   */
  componentDidMount() {
    // 初始化加载一次数据
    this.onEndReached();
  }

  /**
   * 组件更新判定
   * @param {*} nextProps 新的组件属性
   */
  shouldComponentUpdate(nextProps: PaginationProps) {
    return nextProps.dataSource !== this.props.dataSource || nextProps.hasMore !== this.props.hasMore;
  }

  /**
   * 当收到新的数据
   */
  componentWillReceiveProps(nextProps: PaginationProps) {
    let all = [];
    if (nextProps.dataSource !== this.props.dataSource) {
      if (this.props.increment) {
        all = (this.all = (this.all.concat(nextProps.dataSource)));
      } else {
        this.all = all = nextProps.dataSource || [];
      }
    }
    const { dataSource } = this.state;
    this.setState({
      isPaginating: false,
      // 产生新的数据
      dataSource: dataSource.cloneWithRows(this.handleFilter(all)),
    });
  }

  /**
   * 当内容到底部，开始执行滚动分页
   */
  onEndReached() {
    const { isPaginating } = this.state;
    if (!isPaginating && this.props.hasMore) {
      const { onEndReached, pageSize } = this.props;
      const page = this.state.page + 1;
      this.setState({ page, isPaginating: true });
      onEndReached({
        page,
        size: pageSize,
      });
    }
  }

  /**
   * 本地过滤数据
   */
  handleFilter(all: Array<any>) {
    const { filter } = this.props;
    return filter ? all.filter(filter) : all;
  }

  /*
   * 自定义ScrollView 用于转移滚动容器
   * 例如：部分情况下需要的滚动容器，不是分页列表本身，而是所处的父级dom
   * 可以使用此函数来实现此功能
   */
  renderScrollComponent = (props: any) => {
    return <ScrollPortalView {...props} getScrollContainer={this.props.getScrollContainer} />;
  }

  renderListView() {
    const { direction, hasMore, getScrollContainer, ...props } = this.props;
    const className = (this.props.className || '') + ' pagination-view';
    const { dataSource } = this.state;
    const renderFooter = hasMore ? this.props.renderFooter : undefined;
    const renderScrollComponent = getScrollContainer ? this.renderScrollComponent : undefined;
    if (direction === 'bottom-to-top') {
      return (
        <ReverseListView
          hasMore={hasMore}
          className={className}
          page={this.state.page}
          originalRows={this.all}
          renderRow={props.renderRow}
          onEndReached={this.onEndReached}
        />
      );
    }
    return (
      <ListView
        {...props}
        className={className}
        dataSource={dataSource}
        renderFooter={renderFooter}
        onEndReached={this.onEndReached}
        renderScrollComponent={renderScrollComponent}
      />
    );
  }

  // 组件渲染
  render() {
    const { children, className, hasMore } = this.props;
    const isEmpty = !(this.all.length > 0 || hasMore);
    if (isEmpty) {
      return (
        <div className={`pagination-view ${className} list-empty`}>
          {children}
        </div>
      );
    }
    return this.renderListView();
  }
}
