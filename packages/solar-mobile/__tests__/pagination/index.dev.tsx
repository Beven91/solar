/**
 * @name Pagination 调试测试
 * @date 2019-2-18
 */
import './index.scss';
import React from 'react';
import Pagination, { EndReachedEvent } from '../../src/pagination';

export default class App extends React.Component<any, any> {
  state = {
    hasMore: true,
    visible: false,
    orderList: [] as Array<any>,
  }

  constructor(props: any) {
    super(props);
    this.queryOrderList = this.queryOrderList.bind(this);
  }

  createMockOrders(pg: number) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
      return {
        id: `10000${pg}-${item}`,
        name: `数据${pg}-${item}`,
      };
    });
  }

  // 查询订单
  queryOrderList(e: EndReachedEvent) {
    setTimeout(() => {
      this.setState({
        hasMore: e.page < 100,
        orderList: this.createMockOrders(e.page),
      });
    }, 300);
  }

  handleClick = () => {
    this.setState({ visible: true });
  }

  renderRow = (row: any) => {
    return (
      <div className="item">
        <span className="no" onClick={this.handleClick}>{row.id}</span>
        <span className="des">{row.name}</span>
      </div>
    );
  }

  render() {
    const { orderList, hasMore } = this.state;
    return (
      <div style={{ height: '100%', overflow: 'hidden' }} className={`ss ${this.state.visible ? 'visible' : 'hide'}`}>
        <Pagination
          key="order-list"
          className={`order-list ${this.state.visible ? 'visible' : 'hide'}`}
          hasMore={hasMore}
          dataSource={orderList}
          direction="bottom-to-top"
          renderRow={this.renderRow}
          onEndReached={this.queryOrderList}
          pageSize={10}
        />
      </div>
    );
  }
}
