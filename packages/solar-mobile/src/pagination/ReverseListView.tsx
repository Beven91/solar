/**
* @module ReverseListView
* @description 反向滚动的ListView组件
*/
import React from 'react';
import { Icon } from 'antd-mobile';

export interface ReverseListViewProps {
  // 当前页码值
  page: number
  // 原始行数据
  originalRows: Array<any>
  // class样式
  className?: string
  // 渲染每一条数据
  renderRow: (row: any, id: any, rowId?: any, hightlightRow?: boolean) => React.ReactElement<any>
  // 当滚动到底部时触发次函数，用于执行分页操作
  onEndReached: () => void
  // 当滚动顶部出现的内容
  renderHeader?: () => React.ReactElement<any>
  // 是否有更多数据
  hasMore: boolean,
  // 调用onEndReached之前的临界值，单位是像素
  onEndReachedThreshold?: number
}

export default class ReverseListView extends React.Component<ReverseListViewProps, {}> {
  // 默认属性值
  static defaultProps = {
    originalRows: [] as Array<any>,
    onEndReachedThreshold: 20,
    renderHeader: () => (
      <div className="reverse-header">
        <div className="scroll-end-loading">
          <Icon type="loading" className="loading-icon" size="xxs" />
          <span className="loading-text">加载中，请稍后....</span>
        </div>
      </div>
    ),
  }

  private shouldSync: boolean

  private isPaginating: boolean

  private lastScrollTop: number

  private prevScrollHeight: number

  // 滚动容器ref
  containerRef = React.createRef<HTMLDivElement>()

  // 获取当前滚动容器的scrollHeight
  get scrollHeight() {
    return this.getInnerViewNode().scrollHeight;
  }

  // 获取内部dom节点
  getInnerViewNode() {
    return this.containerRef.current;
  }

  // 滚动指定位置
  scrollTo(x: number, y: number) {
    const current = this.getInnerViewNode();
    current.scrollTop = y;
    current.scrollLeft = x || 0;
  }

  // 滚动事件
  handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { hasMore, onEndReached, onEndReachedThreshold } = this.props;
    if (this.isPaginating || !hasMore) {
      return;
    }
    const element = e.target as HTMLDivElement;
    const scrollTop = element.scrollTop;
    this.lastScrollTop = scrollTop;
    if (scrollTop < onEndReachedThreshold) {
      this.isPaginating = true;
      element.classList.add('no-scroll');
      onEndReached();
    }
  }

  // 处理滚动位置
  handlePosition(prevScrollHeight: number) {
    const { page } = this.props;
    const scrollHeight = this.scrollHeight;
    const y = page === 1 ? scrollHeight : this.lastScrollTop + (scrollHeight - prevScrollHeight);
    this.scrollTo(0, y);
    this.containerRef.current.classList.remove('no-scroll');
  }

  /**
   * 当页码值发生变化时，意味着新一页的数据已经请求完毕，这里开始渲染新一页的行数据
   * @param {*}} nextProps 新的属性s
   */
  componentWillReceiveProps(nextProps: ReverseListViewProps) {
    const { originalRows } = nextProps;
    if (!this.shouldSync && originalRows.length !== this.props.originalRows.length) {
      this.prevScrollHeight = this.scrollHeight;
      this.shouldSync = true;
      this.isPaginating = false;
    }
  }

  componentDidUpdate() {
    if (this.shouldSync) {
      this.handlePosition(this.prevScrollHeight);
      this.shouldSync = false;
    }
  }

  renderRows() {
    const { originalRows, renderRow } = this.props;
    const rows = [];
    for (let i = originalRows.length - 1; i >= 0; i--) {
      const row = originalRows[i];
      rows.push(<div className={`row-${i}`} key={`row-${i}`}>{renderRow(row, i)}</div>);
    }
    return rows;
  }

  // 渲染组件
  render() {
    const { className, hasMore, renderHeader } = this.props;
    return (
      <div
        ref={this.containerRef}
        onScroll={this.handleScroll}
        className={`reverser-scroll ${className}`}
      >
        {hasMore ? renderHeader() : ''}
        <div>
          {this.renderRows()}
        </div>
      </div>
    );
  }
}
